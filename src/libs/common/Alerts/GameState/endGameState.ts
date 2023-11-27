import Swal from "sweetalert2";

export const endGameState = (restartGame: () => void, isWin: boolean) => {
  const title = isWin ? "Congratulations!" : "Game Over";
  const text = isWin
    ? "You won the game! 😊"
    : "You ran out of turns. Better luck next time. 😭";

  Swal.fire({
    icon: isWin ? "success" : "error",
    title,
    text,
    showCancelButton: false,
    confirmButtonText: "Retry",
    allowOutsideClick: false,
    allowEscapeKey: false,
  }).then((result) => {
    if (result.isConfirmed) {
      restartGame();
    }
  });
};
