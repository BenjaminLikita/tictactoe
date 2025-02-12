import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import crossImg from './assets/cross.png'
import circleImg from './assets/circle.png'
import './App.css'

type IGameMode = 'human' | 'cpu'
const App = () => {

  const [gameMode, setGameMode] = useState<IGameMode | null>(null)
  const [isWelcome, setIsWelcome] = useState<boolean>(true)

  const returnToMenu = () => {
    setIsWelcome(true)
    setGameMode(null)
  }
  return (
    <main className='flex items-center justify-center flex-col gap-10 bg-gray-900 h-screen'>
      {
        isWelcome ? (
          <>
            <div className="flex gap-5 items-center">
              <motion.img initial={{ rotate: 180, x: -100 }} animate={{ rotate: 0, x: 0 }} transition={{ type: 'spring', bounce: 0.6 }} src={crossImg} alt='cross-img' />
              <motion.img initial={{ rotate: -180, x: 100, y: -100 }} animate={{ rotate: 0, x: 0, y: 0 }} transition={{ type: 'spring', bounce: 0.6 }} src={circleImg} alt='circle-img' />
            </div>
            <p className='font-medium text-lg'>Choose your game mode</p>
            <div className='flex flex-col gap-5'>
              <motion.button onClick={() => { setGameMode("cpu"); setIsWelcome(false) }} whileHover={{ scale: 1.05, rotate: '2deg' }} className='rounded-full py-3 px-8 text-[#57fed0] font-medium text-lg bg-gray-800 cursor-pointer'>Vs CPU</motion.button>
              <motion.button onClick={() => { setGameMode("human"); setIsWelcome(false) }} whileHover={{ scale: 1.05, rotate: '-2deg' }} className='rounded-full py-3 px-8 bg-[#57fed0] font-medium text-lg text-black cursor-pointer'>Vs Friend</motion.button>
            </div>
          </>
        ) : (
          <>
            <motion.h1 initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className='font-bold text-4xl'><span className='text-[#fabe25]'>Tic</span> Tac <span className='text-[#57fed0]'>Toe</span> Game</motion.h1>
            {
              gameMode && <Board gameMode={gameMode} returnToMenu={returnToMenu} />
            }
          </>
        )
      }
    </main>
  )
}

export default App


type IBoardValue = "X" | "O"
const Board = ({gameMode, returnToMenu}: {gameMode: IGameMode, returnToMenu: () => void}) => {
  const [boardValue, setBoardValue] = useState<IBoardValue[]>(Array(9).fill(null))
  const [playerTurn, setPlayerTurn] = useState<IBoardValue>("X")
  const [winner, setWinner] = useState<IBoardValue | 'draw' | null>(null)
  const [score, setScore] = useState({
    x: 0,
    o: 0,
    draw: 0
  })
  // const [gameOver, setGameOver] = useState<boolean>(false)

  const calculateWinner = (squares: (IBoardValue | null)[]) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a]
      }
    }
    
    const isDraw = !squares.some(square => square === null)
    if(isDraw) return "draw"
    return null;
  };

  const handleClick = (index: number) => {
    if(boardValue[index] === null) {
      let newBoard = [...boardValue]
      newBoard[index] = playerTurn
      setBoardValue(newBoard)
      const winner = calculateWinner(newBoard)
      if (winner){
        if(winner === "X") setScore(prev => ({ ...prev, x: prev.x + 1 }))
        if(winner === "O") setScore(prev => ({ ...prev, o: prev.o + 1 }))
        if(winner === "draw") setScore(prev => ({ ...prev, draw: prev.draw + 1 }))
        // else if(winner === "O") setScore({ ...score, y: score.y + 1 })
        // else if(winner === "draw") setScore({ ...score, draw: score.draw + 1 })
        setWinner(winner)
      } else{
        if(gameMode === "human") playerTurn === "X" ? setPlayerTurn("O") : setPlayerTurn("X")     
        else if(gameMode === "cpu") setPlayerTurn("O")
      }
    }
  }

  const minimax = (squares: (IBoardValue | null)[], depth: number, isMaximizing: boolean): { score: number; index: number | null } => {
    const winner = calculateWinner(squares);
    
    // If the CPU wins
    if (winner === 'O') return { score: 10 - depth, index: null };
    // If the human wins
    if (winner === 'X') return { score: depth - 10, index: null };
    // If it's a draw
    if (squares.every(square => square)) return { score: 0, index: null };
    // console.log(winner)

    // return { index: 1, score: 0 }

    if (isMaximizing) {
      let bestScore = -Infinity;
      let bestMove: number | null = null;

      for (let i = 0; i < squares.length; i++) {
        if (!squares[i]) {
          squares[i] = 'O'; // CPU's move
          const { score } = minimax(squares, depth + 1, false);
          squares[i] = null; // Undo the move
          if (score > bestScore) {
            bestScore = score;
            bestMove = i;
          }
        }
      }
      return { score: bestScore, index: bestMove };
    } else {
      let bestScore = Infinity;
      let bestMove: number | null = null;

      for (let i = 0; i < squares.length; i++) {
        if (!squares[i]) {
          squares[i] = 'X'; // Human's move
          const { score } = minimax(squares, depth + 1, true);
          squares[i] = null; // Undo the move

          if (score < bestScore) {
            bestScore = score;
            bestMove = i;
          }
        }
      }
      return { score: bestScore, index: bestMove };
    }
  };

  const getBestMove = (squares: IBoardValue[]) => {
    const { index } = minimax(squares, 0, true); // Start with maximizing for CPU
    return index;
  };

  const handleCPUMove = () => {
    const bestMove = getBestMove(boardValue);
    if (bestMove !== null) {
      const newSquares = boardValue.slice();
      newSquares[bestMove] = 'O'; // CPU's move
      setBoardValue(newSquares);
      // setXIsNext(true); // Switch back to human's turn
      setPlayerTurn("X")
      const winner = calculateWinner(newSquares);
      if(winner === "X") setScore(prev => ({ ...prev, x: prev.x + 1 }))
      if(winner === "O") setScore(prev => ({ ...prev, o: prev.o + 1 }))
      if(winner === "draw") setScore(prev => ({ ...prev, draw: prev.draw + 1 }))
      winner && setWinner(winner);
    }
  };

  useEffect(() => {
    if(gameMode === 'cpu'){
      if(playerTurn === "O") {
        setTimeout(() => {
          handleCPUMove()
          // getCPUTurn()
        }, 500)
      }
    }
  }, [playerTurn])

  

  const resetBoard = () => {
    setBoardValue(Array(9).fill(null))
    setPlayerTurn("X")
    setWinner(null)
  }

  return (
    <>
      <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className='grid grid-cols-3 gap-1'>
        {
          boardValue.map((value, index) => <Square key={index} value={value} onClick={() => handleClick(index)} />)
        }
      </motion.div>
      <div className='flex items-center justify-between w-[340px]'>
        <div className='flex gap-2'>
          <span className='flex items-center justify-center gap-1'>
            <img className='w-[15px] h-[15px]' src={crossImg} alt='player' />:
          </span>
          <span className='text-xl'>{score.x}</span>
        </div>
        <div className='flex gap-2'>
          <span className='flex items-center justify-center gap-1'>
            <img className='w-[15px] h-[15px]' src={circleImg} alt='player' />:
          </span>
          <span className='text-xl'>{score.o}</span>
        </div>
        <div className='flex gap-2'>
          <span className='flex items-center justify-center gap-1'>
            Draw:
          </span>
          <span className='text-xl'>{score.draw}</span>
        </div>
      </div>
      <p className='font-semibold text-xl flex items-center gap-2'>Player <span className='flex items-center'><img className='w-[20px] h-[20px]' src={playerTurn === "X" ? crossImg : circleImg} alt='player' />'s</span> Turn</p>


      <button className='rounded-full py-3 px-8 text-[#57fed0] font-medium text-lg bg-gray-800 cursor-pointer' onClick={resetBoard}>Reset</button>
      <motion.button whileHover={{ scale: 1.08, rotate: '-2deg' }} className='rounded-full py-3 px-8 bg-[#57fed0] font-medium text-lg text-black cursor-pointer' onClick={returnToMenu}>Return to Menu</motion.button>
      { 
        <WinnerModal winner={winner} reset={resetBoard} />
      }
    </>
  )
}

const Square = ({ value, onClick }: { value: IBoardValue, onClick: () => void }) => {
  return (
    <button onClick={onClick} className="w-28 h-28 bg-gray-800 text-4xl text-white font-bold rounded-lg">
      <AnimatePresence>
        {
          value === "X" ? (
            <motion.span className='grid place-items-center' initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 2 }} exit={{ y: 10, opacity: 0 }}>
              <img src={crossImg} className='w-[30px]' alt='user-x' />
            </motion.span>
          ) : value === "O" ? (
            <motion.span className='grid place-items-center' initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }}>
              <img src={circleImg} className='w-[30px]' alt='user-o' />
            </motion.span>
          ) : (
            ""
          )
        }
      </AnimatePresence>
    </button>
  )
}



const WinnerModal = ({ winner, reset }: { winner: IBoardValue | 'draw' | null, reset: () => void }) => {
  return (
    <AnimatePresence>
      {
        winner && (
          <motion.div className='fixed top-0 left-0 w-full h-full bg-gray-900/80 flex items-center justify-center' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className='bg-gray-800 text-white w-[80%] lg:w-[40%] flex flex-col items-center justify-center gap-10 p-10 rounded-lg' initial={{ y: -100 }} animate={{ y: 0 }} exit={{ y: -100 }}>
              {
                winner === 'draw' ? (
                  <h1 className='text-2xl md:text-4xl font-bold flex gap-3'>It's a draw</h1>
                ) : (
                  <h1 className='text-2xl md:text-4xl font-bold flex gap-3'>Player <span className='flex items-center'><img className='w-[30px] h-[30px]' src={winner === "X" ? crossImg : circleImg} /></span> Won</h1>
                )
              }
              <button className='rounded-full py-3 px-8 text-[#57fed0] font-medium text-base md:text-lg bg-gray-800 cursor-pointer' onClick={reset}>Play Again</button>
            </motion.div>
          </motion.div>
        )
      }
    </AnimatePresence>
  )
}