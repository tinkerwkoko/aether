/**
 * Auth server actions.
 *
 * Both actions authorise on the server using the signed-in user's own session,
 * so RLS is what enforces ownership. The service-role key is never used here:
 * a user-scoped read or write must always go through the user's own access.
 */

'use server';

import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/** Signs the user out and returns them to the storefront. */
export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/');
}

/** A uuid, so a bad product id can never reach the database. */
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Saves or unsaves a product for the signed-in user.
 * Returns the new state so the caller can announce it.
 */
export async function toggleSaved(
  productId: string
): Promise<'saved' | 'removed'> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Saving needs an account.');
  }

  if (!UUID_PATTERN.test(productId)) {
    throw new Error('That piece could not be saved.');
  }

  const supabase = await createSupabaseServerClient();

  // Confirm the product really exists before writing a row that would 404 later.
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id')
    .eq('id', productId)
    .maybeSingle();

  if (productError) {
    console.error(
      '[aether] save failed (product lookup):',
      productError.message
    );
    throw new Error("We couldn't save that right now.");
  }

  if (!product) {
    throw new Error('That piece could not be found.');
  }

  const { data: existing, error: readError } = await supabase
    .from('saved_items')
    .select('id')
    .eq('product_id', productId)
    .maybeSingle();

  if (readError) {
    console.error('[aether] save failed (read):', readError.message);
    throw new Error("We couldn't save that right now.");
  }

  if (existing) {
    const { error: deleteError } = await supabase
      .from('saved_items')
      .delete()
      .eq('product_id', productId);

    if (deleteError) {
      console.error('[aether] save failed (delete):', deleteError.message);
      throw new Error("We couldn't remove that right now.");
    }

    return 'removed';
  }

  const { error: insertError } = await supabase
    .from('saved_items')
    .insert({ product_id: productId });

  if (insertError) {
    // A duplicate means it was saved concurrently, which is still "saved".
    if (insertError.code === '23505') return 'saved';

    console.error('[aether] save failed (insert):', insertError.message);
    throw new Error("We couldn't save that right now.");
  }

  return 'saved';
}
