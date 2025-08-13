/**
 * Project Overview Page - REDIRECT
 * Redirects to the new UI Preview project workspace for better UX
 */

import { redirect } from 'next/navigation'

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  // Redirect to the UI Preview project workspace
  redirect(`/ui-preview/projects/${id}`)
}