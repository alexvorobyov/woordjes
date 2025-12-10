import Head from 'next/head'
import Woordjes from '../components/Woordjes'

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>Woordjes</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Woordjes />
      </main>

    </div>
  )
}
