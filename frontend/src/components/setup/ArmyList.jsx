function ArmyList({ army }) {
  return (
    <div className="flex flex-col gap-1">
      {army.map((piece, index) => (
        <div key={index}>
          {index + 1}. {piece}
        </div>
      ))}
    </div>
  )
}

export default ArmyList