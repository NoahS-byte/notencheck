@@ .. @@
 -- Create admin user with encrypted password
 INSERT INTO users (email, password_hash, salt, display_name, is_admin, payment_status) VALUES (
   'admin',
-  'placeholder_hash',
-  'placeholder_salt',
+  'a8b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
+  'f1e2d3c4b5a69870',
   'Administrator',
   true,
   'paid'
 );