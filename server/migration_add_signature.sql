-- 在 Supabase 数据库中添加 signature (签名) 字段
-- 请在 Supabase Dashboard 的 SQL Editor 中运行此命令

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS signature TEXT DEFAULT '时来天地皆同力，运去英雄不自由。';

-- 验证列是否添加成功
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'signature';
