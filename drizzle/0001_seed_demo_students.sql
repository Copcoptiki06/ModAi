INSERT OR IGNORE INTO users (role,username,password_hash,name,teacher_username) VALUES ('teacher','Sedahoca',NULL,'Seda Hoca',NULL);
--> statement-breakpoint
INSERT OR IGNORE INTO users (role,username,password_hash,name,teacher_username) VALUES ('student','ece5a','d7088aafa59ba30dd081c8feeb00acd037f3077cbcc24ef1b2928dc620681ddf','Ece Yılmaz','Sedahoca');
--> statement-breakpoint
INSERT OR IGNORE INTO users (role,username,password_hash,name,teacher_username) VALUES ('student','arda7a','c40d0cfe109baadf8c8e56c993afccf22d5f423f4c5f85671ef034b2e0b5b9f3','Arda Demir','Sedahoca');
--> statement-breakpoint
INSERT OR IGNORE INTO users (role,username,password_hash,name,teacher_username) VALUES ('student','elif7b','ef604c2a9614b32b70702bd5aab0bd4aa07acf1c7af17ea73a114b5c3d942a0f','Elif Kaya','Sedahoca');
--> statement-breakpoint
INSERT OR IGNORE INTO users (role,username,password_hash,name,teacher_username) VALUES ('student','mert7b','2239dfdf125b009e94daa87569226187956d2a53c43468242796153c572dfc30','Mert Can','Sedahoca');
--> statement-breakpoint
INSERT INTO classes (name,teacher_username,grade) SELECT '7-A','Sedahoca',7 WHERE NOT EXISTS (SELECT 1 FROM classes WHERE name='7-A' AND teacher_username='Sedahoca');
--> statement-breakpoint
INSERT INTO classes (name,teacher_username,grade) SELECT '7-B','Sedahoca',7 WHERE NOT EXISTS (SELECT 1 FROM classes WHERE name='7-B' AND teacher_username='Sedahoca');
--> statement-breakpoint
INSERT INTO enrollments (class_id,student_username) SELECT id,'ece5a' FROM classes WHERE name='7-A' AND teacher_username='Sedahoca' AND NOT EXISTS (SELECT 1 FROM enrollments WHERE student_username='ece5a');
--> statement-breakpoint
INSERT INTO enrollments (class_id,student_username) SELECT id,'arda7a' FROM classes WHERE name='7-A' AND teacher_username='Sedahoca' AND NOT EXISTS (SELECT 1 FROM enrollments WHERE student_username='arda7a');
--> statement-breakpoint
INSERT INTO enrollments (class_id,student_username) SELECT id,'elif7b' FROM classes WHERE name='7-B' AND teacher_username='Sedahoca' AND NOT EXISTS (SELECT 1 FROM enrollments WHERE student_username='elif7b');
--> statement-breakpoint
INSERT INTO enrollments (class_id,student_username) SELECT id,'mert7b' FROM classes WHERE name='7-B' AND teacher_username='Sedahoca' AND NOT EXISTS (SELECT 1 FROM enrollments WHERE student_username='mert7b');
--> statement-breakpoint
INSERT INTO questions (grade,unit,topic,type,prompt,options_json,correct_answer,hint,image_url,status) SELECT 7,'Işığın Kırılması','Kırılma yönü','multiple_choice','Işık havadan cama geçerken nasıl kırılır?','[{"text":"Normale yaklaşır","image":""},{"text":"Normalden uzaklaşır","image":""},{"text":"Yön değiştirmez","image":""},{"text":"Geri yansır","image":""}]','Normale yaklaşır','İkinci ortamın optik yoğunluğunu karşılaştır.','/question-images/refraction-air-glass.png','published' WHERE NOT EXISTS (SELECT 1 FROM questions WHERE prompt='Işık havadan cama geçerken nasıl kırılır?');
--> statement-breakpoint
WITH RECURSIVE n(x) AS (VALUES(1) UNION ALL SELECT x+1 FROM n WHERE x<22) INSERT INTO attempts (student_username,question_id,answer,is_correct,duration_seconds,hints_used,created_at) SELECT 'ece5a',(SELECT id FROM questions WHERE prompt='Işık havadan cama geçerken nasıl kırılır?' LIMIT 1),CASE WHEN x<=18 THEN 'Normale yaklaşır' ELSE 'Normalden uzaklaşır' END,CASE WHEN x<=18 THEN 1 ELSE 0 END,72+x,CASE WHEN x%4=0 THEN 1 ELSE 0 END,datetime('now','-'||(23-x)||' hours') FROM n WHERE NOT EXISTS (SELECT 1 FROM attempts WHERE student_username='ece5a');
--> statement-breakpoint
WITH RECURSIVE n(x) AS (VALUES(1) UNION ALL SELECT x+1 FROM n WHERE x<21) INSERT INTO attempts (student_username,question_id,answer,is_correct,duration_seconds,hints_used,created_at) SELECT 'arda7a',(SELECT id FROM questions WHERE prompt='Işık havadan cama geçerken nasıl kırılır?' LIMIT 1),CASE WHEN x<=14 THEN 'Normale yaklaşır' ELSE 'Normalden uzaklaşır' END,CASE WHEN x<=14 THEN 1 ELSE 0 END,80+x,CASE WHEN x%3=0 THEN 1 ELSE 0 END,datetime('now','-'||(22-x)||' hours') FROM n WHERE NOT EXISTS (SELECT 1 FROM attempts WHERE student_username='arda7a');
--> statement-breakpoint
WITH RECURSIVE n(x) AS (VALUES(1) UNION ALL SELECT x+1 FROM n WHERE x<24) INSERT INTO attempts (student_username,question_id,answer,is_correct,duration_seconds,hints_used,created_at) SELECT 'elif7b',(SELECT id FROM questions WHERE prompt='Işık havadan cama geçerken nasıl kırılır?' LIMIT 1),CASE WHEN x<=22 THEN 'Normale yaklaşır' ELSE 'Normalden uzaklaşır' END,CASE WHEN x<=22 THEN 1 ELSE 0 END,65+x,CASE WHEN x%6=0 THEN 1 ELSE 0 END,datetime('now','-'||(25-x)||' hours') FROM n WHERE NOT EXISTS (SELECT 1 FROM attempts WHERE student_username='elif7b');
--> statement-breakpoint
WITH RECURSIVE n(x) AS (VALUES(1) UNION ALL SELECT x+1 FROM n WHERE x<19) INSERT INTO attempts (student_username,question_id,answer,is_correct,duration_seconds,hints_used,created_at) SELECT 'mert7b',(SELECT id FROM questions WHERE prompt='Işık havadan cama geçerken nasıl kırılır?' LIMIT 1),CASE WHEN x<=10 THEN 'Normale yaklaşır' ELSE 'Normalden uzaklaşır' END,CASE WHEN x<=10 THEN 1 ELSE 0 END,88+x,CASE WHEN x%2=0 THEN 1 ELSE 0 END,datetime('now','-'||(20-x)||' hours') FROM n WHERE NOT EXISTS (SELECT 1 FROM attempts WHERE student_username='mert7b');
--> statement-breakpoint
WITH RECURSIVE n(x) AS (VALUES(1) UNION ALL SELECT x+1 FROM n WHERE x<8) INSERT INTO ai_interactions (student_username,question_id,kind,content,helped,created_at) SELECT 'ece5a',(SELECT id FROM questions WHERE prompt='Işık havadan cama geçerken nasıl kırılır?' LIMIT 1),'hint','Normal çizgisine göre düşün.',CASE WHEN x<=6 THEN 1 ELSE 0 END,datetime('now','-'||x||' hours') FROM n WHERE NOT EXISTS (SELECT 1 FROM ai_interactions WHERE student_username='ece5a');
--> statement-breakpoint
WITH RECURSIVE n(x) AS (VALUES(1) UNION ALL SELECT x+1 FROM n WHERE x<14) INSERT INTO ai_interactions (student_username,question_id,kind,content,helped,created_at) SELECT 'arda7a',(SELECT id FROM questions WHERE prompt='Işık havadan cama geçerken nasıl kırılır?' LIMIT 1),'hint','Ortam yoğunluğunu karşılaştır.',CASE WHEN x<=9 THEN 1 ELSE 0 END,datetime('now','-'||x||' hours') FROM n WHERE NOT EXISTS (SELECT 1 FROM ai_interactions WHERE student_username='arda7a');
--> statement-breakpoint
WITH RECURSIVE n(x) AS (VALUES(1) UNION ALL SELECT x+1 FROM n WHERE x<4) INSERT INTO ai_interactions (student_username,question_id,kind,content,helped,created_at) SELECT 'elif7b',(SELECT id FROM questions WHERE prompt='Işık havadan cama geçerken nasıl kırılır?' LIMIT 1),'example','Tam yansıma örneğini incele.',1,datetime('now','-'||x||' hours') FROM n WHERE NOT EXISTS (SELECT 1 FROM ai_interactions WHERE student_username='elif7b');
--> statement-breakpoint
WITH RECURSIVE n(x) AS (VALUES(1) UNION ALL SELECT x+1 FROM n WHERE x<17) INSERT INTO ai_interactions (student_username,question_id,kind,content,helped,created_at) SELECT 'mert7b',(SELECT id FROM questions WHERE prompt='Işık havadan cama geçerken nasıl kırılır?' LIMIT 1),'hint','Kırılma yönünü yeniden modelle.',CASE WHEN x<=8 THEN 1 ELSE 0 END,datetime('now','-'||x||' hours') FROM n WHERE NOT EXISTS (SELECT 1 FROM ai_interactions WHERE student_username='mert7b');
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_users_teacher_role ON users(teacher_username,role);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_attempts_student ON attempts(student_username);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_ai_student ON ai_interactions(student_username);
--> statement-breakpoint
PRAGMA optimize;
