-- Allow users to insert their own role during signup
CREATE POLICY "Usuários podem inserir sua própria role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);