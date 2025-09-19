import Image from "next/image";
import { supabase } from '../lib/supabase';


export default async function Home() {
  const { data: companies } = await supabase
    .from('german_companies')
    .select('id, email, company')
    .limit(10)

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold">First 10 Companies</h1>
      <ul className="mt-4 list-disc pl-6">
        {companies?.map((c) => (
          <li key={c.id}>{c.company} ({c.email})</li>
        ))}
      </ul>
    </main>
  )
}

