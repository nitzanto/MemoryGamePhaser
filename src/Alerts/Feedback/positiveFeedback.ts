import Swal from "sweetalert2";

export const showPositiveFeedback = () => {
  const positiveFeedbackArray: string[] = [
    "Great job!",
    "Well done!",
    "Awesome!",
  ];

  const randomIndex = Math.floor(Math.random() * positiveFeedbackArray.length);
  const message = positiveFeedbackArray[randomIndex];

  Swal.fire({
    icon: "success",
    title: "Match!",
    text: message,
    timer: 2000,
    showConfirmButton: false,
  });
};
