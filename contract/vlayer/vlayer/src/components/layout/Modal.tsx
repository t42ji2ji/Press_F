import { AnimatePresence, motion } from "motion/react";
import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useCurrentStep } from "../../hooks/useCurentStep";
import { STEP_KIND } from "../../utils/steps";
import { StepErrorBoundaryComponent } from "./ErrorBoundary";
import { Navigation } from "./Navigation";

export const modalContext = createContext({
  showModal: () => { },
  closeModal: () => { },
});

export const Modal = ({ children }: { children: React.ReactNode }) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  const showModal = useCallback(() => {
    modalRef.current?.showModal();
  }, [modalRef]);

  const closeModal = useCallback(() => {
    modalRef.current?.close();
  }, [modalRef]);

  useEffect(() => {
    showModal();
  }, [showModal]);
  const { currentStep } = useCurrentStep();
  const [isWelcome, setIsWelcome] = useState(false);
  const [isSuccessStep, setIsSuccessStep] = useState(false);
  const [isTokenList, setIsTokenList] = useState(false);
  const [isTradeStep, setIsTradeStep] = useState(false);
  useEffect(() => {
    setIsWelcome(currentStep?.kind === STEP_KIND.WELCOME);
    setIsSuccessStep(currentStep?.kind === STEP_KIND.SUCCESS);
    setIsTokenList(currentStep?.kind === STEP_KIND.TOKEN_LIST);
    setIsTradeStep(currentStep?.kind === STEP_KIND.TRADE);
  }, [currentStep?.kind]);

  const [descClass, setDescClass] = useState("");
  const [description, setDescription] = useState("");
  useEffect(() => {
    setDescClass("out");

    setTimeout(() => {
      setDescClass("in");
      setDescription(currentStep?.description || "");
    }, 300);
  }, [currentStep?.description]);

  return (
    <dialog className="modal" ref={modalRef}>
      {/* Simplified Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-black to-blue-900 opacity-90" />

      {/* Main Modal Container - 根據是否為TokenList或Trade調整尺寸 */}
      <div className={`modal-box bg-black/90 backdrop-blur-xl rounded-2xl border-2 border-purple-500/50 shadow-2xl shadow-purple-500/25 relative overflow-hidden ${isTokenList
        ? 'w-11/12 max-w-7xl h-5/6 max-h-[90vh]'
        : isTradeStep
          ? 'w-11/12 max-w-4xl h-5/6 max-h-[90vh]'
          : 'w-full max-w-2xl'
        }`}>

        {/* Content Container */}
        <motion.div
          className="relative z-10 flex flex-col justify-between p-4 h-full"
          initial={{ opacity: 0, scale: 0.3, rotateY: 180 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          exit={{ opacity: 0, scale: 0.3, rotateY: -180 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
            duration: 0.8
          }}
        >
          {/* Navigation with Glow */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Navigation />
          </motion.div>

          <ErrorBoundary FallbackComponent={StepErrorBoundaryComponent}>
            {/* Header Icon with Epic Effects - 只在非TokenList和非Trade時顯示 */}
            <AnimatePresence>
              {currentStep?.headerIcon && !isTokenList && !isTradeStep && (
                <motion.div
                  className="relative flex justify-center items-center"
                  initial={{ opacity: 0, scale: 0.1, y: -100 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.1, y: 100 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                    duration: 0.6
                  }}
                >
                  {/* Glow Effect Behind Icon */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-30"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.img
                    src={currentStep?.headerIcon}
                    alt="Step Icon"
                    className="relative w-[282px] h-[150px] drop-shadow-2xl"
                    whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className={`flex-col flex gap-6 justify-center mb-2 w-full ${isTokenList || isTradeStep ? 'flex-1 min-h-0' : 'h-[284px]'
              }`}>
              {/* Game Title with Glitch Effect */}
              {currentStep?.gameTitle && (
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, type: "spring" }}
                >
                  <motion.h2
                    className="text-lg font-bold text-transparent bg-gradient-to-r from-cyan-400 via-yellow-400 to-pink-400 bg-clip-text tracking-wider"
                    animate={{
                      textShadow: [
                        "0 0 10px #00ffff",
                        "0 0 20px #ffff00",
                        "0 0 10px #ff00ff",
                        "0 0 10px #00ffff"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {currentStep.gameTitle}
                  </motion.h2>
                </motion.div>
              )}

              {/* Main Title with Epic Typography */}
              {currentStep?.title && (
                <motion.h3
                  className={`text-center text-2xl font-bold text-white drop-shadow-lg ${descClass}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  style={{
                    textShadow: "0 0 20px rgba(139, 92, 246, 0.8), 0 0 40px rgba(139, 92, 246, 0.4)"
                  }}
                >
                  {currentStep?.title}
                </motion.h3>
              )}

              {/* Description with Gaming Flair - TokenList和Trade時縮小或隱藏 */}
              {!isTokenList && !isTradeStep && (
                <motion.div
                  className="text-center px-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <p className={`text-gray-300 leading-relaxed ${descClass} text-lg`}>
                    {description}
                  </p>
                </motion.div>
              )}

              {/* TokenList和Trade時的簡化描述 */}
              {(isTokenList || isTradeStep) && (
                <motion.div
                  className="text-center px-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <p className={`text-gray-300 leading-relaxed ${descClass} text-sm`}>
                    {description}
                  </p>
                </motion.div>
              )}

              {/* Content with Slide-in Effect - TokenList和Trade時佔滿剩餘空間 */}
              <motion.div
                className={isTokenList || isTradeStep ? "flex-1 overflow-auto" : ""}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, type: "spring" }}
              >
                <modalContext.Provider value={{ showModal, closeModal }}>
                  {children}
                </modalContext.Provider>
              </motion.div>
            </div>
          </ErrorBoundary>
        </motion.div>

        {/* Corner Decorations */}
        <div className="absolute top-4 left-4 w-4 h-4 border-l-2 border-t-2 border-yellow-400 opacity-60" />
        <div className="absolute top-4 right-4 w-4 h-4 border-r-2 border-t-2 border-yellow-400 opacity-60" />
        <div className="absolute bottom-4 left-4 w-4 h-4 border-l-2 border-b-2 border-yellow-400 opacity-60" />
        <div className="absolute bottom-4 right-4 w-4 h-4 border-r-2 border-b-2 border-yellow-400 opacity-60" />
      </div>
    </dialog>
  );
};
