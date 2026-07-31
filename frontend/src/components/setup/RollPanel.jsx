import ArmyList from './ArmyList.jsx'

function RollPanel({ color, state }) {
  return (
    <div className="flex flex-col items-center gap-3">

      <h2>{color}</h2>

      <input
        placeholder={`${color} Player`}
        value={state.players[color]}
        onChange={(e) => state.setPlayerName(color, e.target.value)}
        className="bg-slate-800 p-2 rounded"
      />

      <button
        onClick={() => state.rollPiece(color)}
        className="bg-cyan-500 px-4 py-2 rounded text-black"
      >
        Roll
      </button>

      <ArmyList army={state.armies[color]} />

    </div>
  )
}

export default RollPanel