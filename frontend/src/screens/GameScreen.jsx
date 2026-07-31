import { useState } from "react";

import Board from "../components/board/Board.jsx";

import MatchLogModal from "../components/panels/MatchLogModal.jsx";
import PromotionModal from "../components/panels/PromotionModal.jsx";
import TimerSetupPanel from "../components/panels/TimerSetupPanel.jsx";
import VariantSetupPanel from "../components/panels/VariantSetupPanel.jsx";
import WinnerModal from "../components/panels/WinnerModal.jsx";

import HeaderBar from "../components/layout/HeaderBar.jsx";
import BottomNav from "../components/layout/BottomNav.jsx";
import PlayerPanelCard from "../components/panels/PlayerPanelCard.jsx";
import MoveLogBar from "../components/panels/MoveLogBar.jsx";

import useGameController from "../hooks/useGameController.js";

function GameScreen({ onlineMatch, onExitToMenu }) {
  const game = useGameController({ onlineMatch });
  const [activeTab, setActiveTab] = useState("board");

  const {
    variant,
    setVariant,
    customPieces,
    setCustomPieces,
    setupConfirmed,
    setSetupConfirmed,

    timerEnabled,
    setTimerEnabled,
    reserveOption,
    setReserveOption,
    customReserveMinutes,
    setCustomReserveMinutes,
    RESERVE_OPTIONS,
    formatClock,
    currentReserveSeconds,
    hasReserveEnabled,
    timerState,
    activeTimerColor,
    seizureAction,
    timeoutStatus,

    matchLog,
    isMatchLogOpen,
    openMatchLog,
    closeMatchLog,
    copyMatchLogText,

    pieces,
    selectedPieceId,
    boardLegalTargets,
    handleSquareClick,
    whiteHome,
    blackHome,
    isFlipped,

    whiteArmy,
    blackArmy,
    whiteReady,
    blackReady,
    setWhiteReady,
    setBlackReady,
    rollPiece,
    moveUp,
    moveDown,
    getQueueLabel,
    calculateMaterialTotal,
    isDraftComplete,

    whiteScore,
    blackScore,
    whiteMoves,
    blackMoves,
    MOVE_LIMIT,
    isGameStarted,

    pendingInitialSupportColor,
    initialSupportQueues,
    pendingSpawnColor,
    getSpawnTargets,
    pendingHomeAttack,

    pendingPromotion,
    getSoldierPromotionEligibleTypes,
    handlePromotion,

    winner,
    resetGame,

    socketStatus,
    localColor,
  } = game;

  const opponentColor = localColor === "WHITE" ? "BLACK" : "WHITE";
  const opponentArmy = localColor === "WHITE" ? blackArmy : whiteArmy;
  const playerArmy = localColor === "WHITE" ? whiteArmy : blackArmy;
  const opponentScore = localColor === "WHITE" ? blackScore : whiteScore;
  const playerScore = localColor === "WHITE" ? whiteScore : blackScore;
  const opponentMoves = localColor === "WHITE" ? blackMoves : whiteMoves;
  const playerMoves = localColor === "WHITE" ? whiteMoves : blackMoves;

  return (
    <main className="relative h-dvh w-full bg-[var(--color-surface-primary)] text-white overflow-hidden flex flex-col">
      {/* Header — compact */}
      <div className="flex-shrink-0">
        <HeaderBar onBack={onExitToMenu} />
      </div>

      {/* Online match indicator */}
      {onlineMatch && (
        <div className="absolute left-3 top-14 z-30 rounded-full border border-cyan-400/30 bg-slate-950/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-cyan-300">
          Room {onlineMatch.roomCode} · {socketStatus}
        </div>
      )}

      {/* Setup Panels (before game starts) */}
      {!isGameStarted && (
        <div className="flex-1 overflow-y-auto px-3 py-4 pb-20">
          <VariantSetupPanel
            isGameStarted={isGameStarted}
            isConfirmed={setupConfirmed}
            variant={variant}
            setVariant={setVariant}
            customPieces={customPieces}
            setCustomPieces={setCustomPieces}
            onConfirm={() => setSetupConfirmed(true)}
          />

          <TimerSetupPanel
            isGameStarted={isGameStarted}
            isConfirmed={setupConfirmed}
            timerEnabled={timerEnabled}
            setTimerEnabled={setTimerEnabled}
            reserveOption={reserveOption}
            setReserveOption={setReserveOption}
            customReserveMinutes={customReserveMinutes}
            setCustomReserveMinutes={setCustomReserveMinutes}
            RESERVE_OPTIONS={RESERVE_OPTIONS}
            formatClock={formatClock}
            currentReserveSeconds={currentReserveSeconds}
            onConfirm={() => setSetupConfirmed(true)}
          />
        </div>
      )}

      {/* Main Game View — fits on one screen, no scrolling */}
      {isGameStarted && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden pb-14">
          {/* Opponent Panel (top) — muted */}
          <div className="flex-shrink-0 px-2 pt-1">
            <PlayerPanelCard
              color={opponentColor}
              playerName={`${opponentColor === "BLACK" ? "Black" : "White"} Player`}
              army={opponentArmy}
              score={opponentScore}
              moves={opponentMoves}
              MOVE_LIMIT={MOVE_LIMIT}
              isGameStarted={isGameStarted}
              timerEnabled={timerEnabled}
              activeTimerColor={activeTimerColor}
              timerState={timerState}
              hasReserveEnabled={hasReserveEnabled}
              formatClock={formatClock}
              currentReserveSeconds={currentReserveSeconds}
              isCurrentTurn={activeTimerColor === opponentColor}
              isOpponent={true}
            />
          </div>

          {/* Board (center) — hero, fills remaining space */}
          <div className="flex-1 flex items-center justify-center py-1.5 min-h-0">
            <Board
              pieces={pieces}
              selectedPieceId={selectedPieceId}
              legalTargets={boardLegalTargets}
              onSquareClick={handleSquareClick}
              whiteHome={whiteHome}
              blackHome={blackHome}
              isFlipped={isFlipped}
            />
          </div>

          {/* Player Panel (bottom) — full opacity */}
          <div className="flex-shrink-0 px-2 pb-1">
            <PlayerPanelCard
              color={localColor}
              playerName={`${localColor === "BLACK" ? "Black" : "White"} Player`}
              army={playerArmy}
              score={playerScore}
              moves={playerMoves}
              MOVE_LIMIT={MOVE_LIMIT}
              isGameStarted={isGameStarted}
              timerEnabled={timerEnabled}
              activeTimerColor={activeTimerColor}
              timerState={timerState}
              hasReserveEnabled={hasReserveEnabled}
              formatClock={formatClock}
              currentReserveSeconds={currentReserveSeconds}
              isCurrentTurn={activeTimerColor === localColor}
              isOpponent={false}
            />
          </div>

          {/* Move Log Bar — compact strip */}
          <div className="flex-shrink-0">
            <MoveLogBar matchLog={matchLog} onViewAll={openMatchLog} />
          </div>
        </div>
      )}

      {/* Promotion Modal */}
      <PromotionModal
        promotionPending={pendingPromotion}
        eligibleTypes={getSoldierPromotionEligibleTypes()}
        onSelectPromotion={handlePromotion}
      />

      {/* Winner Modal */}
      <WinnerModal
        winner={winner}
        blackScore={blackScore}
        whiteScore={whiteScore}
        onViewLog={openMatchLog}
        onRestart={resetGame}
      />

      {/* Match Log Modal */}
      <MatchLogModal
        isOpen={isMatchLogOpen}
        matchLog={matchLog}
        onClose={closeMatchLog}
        onCopy={copyMatchLogText}
      />

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === "moves") {
            openMatchLog();
          }
        }}
      />
    </main>
  );
}

export default GameScreen;
