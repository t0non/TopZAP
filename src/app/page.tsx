'use client';
import { useUser } from '@/firebase';
import { redirect } from 'next/navigation';

export default function Home() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return null; // Or a loading spinner
  }

  if (user) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
