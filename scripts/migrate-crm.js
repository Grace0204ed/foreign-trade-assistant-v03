const path = require("path");
const Database = require("better-sqlite3");
const { db } = require("../server/db");

const sourcePath = process.argv[2];
if (!sourcePath) throw new Error("Missing CRM database path.");
const source = new Database(path.resolve(sourcePath), { readonly: true });

const customers = source.prepare(`SELECT * FROM customers
  WHERE NOT (name='Ahmed' AND phone='+971 50 123 4567')`).all();
const followUps = source.prepare(`SELECT f.* FROM follow_ups f
  JOIN customers c ON c.id=f.customer_id
  WHERE NOT (c.name='Ahmed' AND c.phone='+971 50 123 4567')`).all();

const insertCustomer = db.prepare(`INSERT OR REPLACE INTO customers
  (id,name,phone,country,buyer_type,stage,grade,project_tags,equipment_tags,requirement,arrival_precision,arrival_value,next_follow_up,next_follow_purpose,whatsapp_number,created_at,updated_at)
  VALUES (@id,@name,@phone,@country,@buyer_type,@stage,@grade,@project_tags,@equipment_tags,@requirement,@arrival_precision,@arrival_value,@next_follow_up,@next_follow_purpose,@whatsapp_number,@created_at,@updated_at)`);
const insertFollowUp = db.prepare(`INSERT OR REPLACE INTO follow_ups
  (id,customer_id,content,contact_type,outcome,old_stage,new_stage,old_grade,new_grade,next_follow_up,next_follow_purpose,created_at)
  VALUES (@id,@customer_id,@content,@contact_type,@outcome,@old_stage,@new_stage,@old_grade,@new_grade,@next_follow_up,@next_follow_purpose,@created_at)`);

db.transaction(() => {
  customers.forEach((customer) => insertCustomer.run(customer));
  followUps.forEach((followUp) => insertFollowUp.run(followUp));
})();

console.log(JSON.stringify({ customers: customers.length, followUps: followUps.length }));
source.close();
db.close();
