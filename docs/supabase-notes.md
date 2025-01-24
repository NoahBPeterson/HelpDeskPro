# Supabase Notes

## Type Generation
- The command `supabase gen types typescript` prompts for project selection and doesn't immediately print to stdout
- Don't redirect output (`>`) directly as it will overwrite the file with the prompt text
- Instead:
  1. Run `supabase gen types typescript`
  2. Select your project
  3. Copy the generated types
  4. Paste into `src/lib/database.types.ts` 

We are using the remote Supabase database; please don't use local.

