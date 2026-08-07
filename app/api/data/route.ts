import { env } from "cloudflare:workers";
import { readSession } from "../auth/session";

type Action = { action?: string; [key: string]: unknown };

function db() {
  if (!env.DB) throw new Error("Veritabanı bağlantısı hazır değil.");
  return env.DB;
}

function clean(value: unknown, max = 300) { return String(value ?? "").trim().slice(0, max); }
async function hash(value: string) {
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
  return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
}

export async function GET(request: Request) {
  const session = await readSession(request);
  if (!session) return Response.json({ error: "Oturum gerekli." }, { status: 401 });
  const store = db();
  if (session.role === "admin") {
    const [users, classes, questions, attempts, notifications, ai] = await Promise.all([
      store.prepare("SELECT id, role, username, name, email, teacher_username, created_at FROM users ORDER BY id DESC").all(),
      store.prepare("SELECT * FROM classes ORDER BY id DESC").all(),
      store.prepare("SELECT * FROM questions ORDER BY id DESC").all(),
      store.prepare("SELECT * FROM attempts ORDER BY id DESC LIMIT 200").all(),
      store.prepare("SELECT * FROM notifications ORDER BY id DESC LIMIT 100").all(),
      store.prepare("SELECT * FROM ai_interactions ORDER BY id DESC LIMIT 200").all(),
    ]);
    return Response.json({ users: users.results, classes: classes.results, questions: questions.results, attempts: attempts.results, notifications: notifications.results, aiInteractions: ai.results });
  }
  if (session.role === "teacher") {
    const owner = session.username || "Sedahoca";
    const classes = await store.prepare("SELECT * FROM classes WHERE teacher_username = ? ORDER BY id DESC").bind(owner).all();
    const students = await store.prepare("SELECT u.id,u.username,u.name,u.created_at,e.class_id,c.name AS class_name,COUNT(a.id) AS attempt_count,COALESCE(SUM(CASE WHEN a.is_correct=1 THEN 1 ELSE 0 END),0) AS correct_count,COALESCE(SUM(CASE WHEN a.is_correct=0 THEN 1 ELSE 0 END),0) AS wrong_count,COALESCE(SUM(a.duration_seconds),0) AS duration_seconds,COALESCE(SUM(a.hints_used),0) AS hints_used FROM users u LEFT JOIN enrollments e ON e.student_username=u.username LEFT JOIN classes c ON c.id=e.class_id LEFT JOIN attempts a ON a.student_username=u.username WHERE u.role='student' AND u.teacher_username=? GROUP BY u.id,u.username,u.name,u.created_at,e.class_id,c.name ORDER BY u.id").bind(owner).all();
    const notifications = await store.prepare("SELECT * FROM notifications WHERE teacher_username=? ORDER BY id DESC").bind(owner).all();
    const attempts = await store.prepare("SELECT a.*,q.topic,q.prompt FROM attempts a JOIN users u ON u.username=a.student_username LEFT JOIN questions q ON q.id=a.question_id WHERE u.teacher_username=? ORDER BY a.id DESC LIMIT 200").bind(owner).all();
    const ai = await store.prepare("SELECT ai.* FROM ai_interactions ai JOIN users u ON u.username=ai.student_username WHERE u.teacher_username=? ORDER BY ai.id DESC LIMIT 200").bind(owner).all();
    return Response.json({ classes: classes.results, students: students.results, notifications: notifications.results, attempts: attempts.results, aiInteractions: ai.results });
  }
  const username = session.username || "ece5a";
  const questions = await store.prepare("SELECT id,grade,unit,topic,type,prompt,options_json,hint,image_url FROM questions WHERE status='published' ORDER BY id").all();
  const notifications = await store.prepare("SELECT n.* FROM notifications n JOIN enrollments e ON e.class_id=n.class_id WHERE e.student_username=? ORDER BY n.id DESC").bind(username).all();
  const attempts = await store.prepare("SELECT * FROM attempts WHERE student_username=? ORDER BY id DESC").bind(username).all();
  return Response.json({ questions: questions.results, notifications: notifications.results, attempts: attempts.results });
}

export async function POST(request: Request) {
  const session = await readSession(request);
  if (!session) return Response.json({ error: "Oturum gerekli." }, { status: 401 });
  const body = await request.json() as Action;
  const store = db();
  if (body.action === "create_question" && session.role === "admin") {
    const prompt = clean(body.prompt, 600), correct = clean(body.correctAnswer, 300);
    if (!prompt || !correct) return Response.json({ error: "Soru ve doğru cevap zorunlu." }, { status: 400 });
    const result = await store.prepare("INSERT INTO questions (grade,unit,topic,type,prompt,options_json,correct_answer,hint,image_url,status) VALUES (?,?,?,?,?,?,?,?,?,?)")
      .bind(Number(body.grade)||7, clean(body.unit)||"Işığın Kırılması", clean(body.topic)||"Işığın kırılması", clean(body.type)||"multiple_choice", prompt, JSON.stringify(body.options ?? []), correct, clean(body.hint,600), clean(body.imageUrl,500)||null, body.status === "draft" ? "draft" : "published").run();
    return Response.json({ ok: true, id: result.meta.last_row_id }, { status: 201 });
  }
  if (body.action === "create_class" && session.role === "teacher") {
    const name = clean(body.name,60); if (!name) return Response.json({ error: "Sınıf adı zorunlu." }, { status: 400 });
    const result = await store.prepare("INSERT INTO classes (name,teacher_username,grade) VALUES (?,?,?)").bind(name,session.username||"Sedahoca",Number(body.grade)||7).run();
    return Response.json({ ok:true,id:result.meta.last_row_id },{status:201});
  }
  if (body.action === "create_student" && session.role === "teacher") {
    const username=clean(body.username,40),name=clean(body.name,80),password=clean(body.password,80),classId=Number(body.classId);
    if(!username||!name||password.length<6||!classId)return Response.json({error:"Ad, kullanıcı adı, en az 6 karakter şifre ve sınıf gerekli."},{status:400});
    const passwordHash=await hash(password);
    try { await store.batch([store.prepare("INSERT INTO users (role,username,password_hash,name,teacher_username) VALUES ('student',?,?,?,?)").bind(username,passwordHash,name,session.username||"Sedahoca"),store.prepare("INSERT INTO enrollments (class_id,student_username) VALUES (?,?)").bind(classId,username)]); }
    catch { return Response.json({error:"Bu kullanıcı adı zaten kullanılıyor."},{status:409}); }
    return Response.json({ok:true},{status:201});
  }
  if (body.action === "send_notification" && session.role === "teacher") {
    const title=clean(body.title,100),message=clean(body.message,600),classId=Number(body.classId);
    if(!title||!message||!classId)return Response.json({error:"Sınıf, başlık ve mesaj zorunlu."},{status:400});
    await store.prepare("INSERT INTO notifications (class_id,teacher_username,title,message,unit) VALUES (?,?,?,?,?)").bind(classId,session.username||"Sedahoca",title,message,clean(body.unit,100)||null).run();
    return Response.json({ok:true},{status:201});
  }
  if (body.action === "record_attempt" && session.role === "student") {
    const questionId=Number(body.questionId),answer=clean(body.answer,600); if(!questionId||!answer)return Response.json({error:"Cevap eksik."},{status:400});
    const row=await store.prepare("SELECT correct_answer FROM questions WHERE id=? AND status='published'").bind(questionId).first<{correct_answer:string}>();
    if(!row)return Response.json({error:"Soru bulunamadı."},{status:404});
    const correct=row.correct_answer.trim().toLocaleLowerCase("tr-TR")===answer.toLocaleLowerCase("tr-TR");
    await store.prepare("INSERT INTO attempts (student_username,question_id,answer,is_correct,duration_seconds,hints_used) VALUES (?,?,?,?,?,?)").bind(session.username||"ece5a",questionId,answer,correct?1:0,Number(body.durationSeconds)||0,Number(body.hintsUsed)||0).run();
    return Response.json({ok:true,correct});
  }
  if (body.action === "ai_interaction" && session.role === "student") {
    await store.prepare("INSERT INTO ai_interactions (student_username,question_id,kind,content,helped) VALUES (?,?,?,?,?)").bind(session.username||"ece5a",Number(body.questionId)||null,clean(body.kind,40)||"hint",clean(body.content,1000),body.helped?1:0).run();
    return Response.json({ok:true},{status:201});
  }
  return Response.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });
}
