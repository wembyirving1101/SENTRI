import DispatchConsole from '@/components/DispatchConsole'
import { currentPlayer } from '@/lib/player-auth'
import { redirect } from 'next/navigation'
export default async function Home() {
  const player=await currentPlayer()
  if(!player) redirect('/login')
  return <DispatchConsole player={player} />
}
