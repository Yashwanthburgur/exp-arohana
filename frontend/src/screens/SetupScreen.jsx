import RollPanel from '../components/setup/RollPanel.jsx'

function SetupScreen({ state }) {
  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center gap-10 text-white">

      <RollPanel color="BLACK" state={state} />
      <RollPanel color="WHITE" state={state} />

      <button
        onClick={state.startGame}
        className="bg-green-500 px-6 py-3 rounded text-black font-bold"
      >
        Start Game
      </button>

    </main>
  )
}

export default SetupScreen