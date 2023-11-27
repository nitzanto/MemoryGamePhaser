import Swal from "sweetalert2";

export const showNegativeFeedback = () => {
  const negativeFeedbackArray: string[] = [
    "Oops, try again!",
    "Not quite there!",
    "Keep practicing!",
  ];

  const randomIndex = Math.floor(Math.random() * negativeFeedbackArray.length);
  const message = negativeFeedbackArray[randomIndex];

  Swal.fire({
    icon: "error",
    title: "No match!",
    text: message,
    timer: 2000,
    showConfirmButton: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
  });
};
