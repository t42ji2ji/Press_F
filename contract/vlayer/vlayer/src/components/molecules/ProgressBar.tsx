import { motion } from "motion/react";
import { useCurrentStep } from "../../hooks/useCurentStep";
import { steps } from "../../utils/steps";

export const ProgressBar = () => {
  const { currentStep } = useCurrentStep();

  // 计算总XP和当前XP
  const totalPossibleXP = steps.reduce((sum, step) => sum + (step.xpReward || 0), 0);
  const currentXP = steps
    .slice(0, (currentStep?.index || 0) + 1)
    .reduce((sum, step) => sum + (step.xpReward || 0), 0);

  const progressPercentage = (currentXP / totalPossibleXP) * 100;

  const levelNames = [
    "👶 CRYPTO NOOB",
    "🤝 WALLET WARRIOR",
    "🔮 SOUL HARVESTER",
    "💎 NFT LEGEND"
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ease: "easeOut", duration: 0.5, delay: 0.3 }}
      className="w-full space-y-4"
    >
      {/* XP Header */}
      <motion.div
        className="flex justify-between items-center px-2"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
      >
        <div className="text-lg font-bold text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 bg-clip-text">
          ⚡ {currentXP} / {totalPossibleXP} XP
        </div>
        <div className="text-sm font-semibold text-transparent bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text">
          {levelNames[Math.min(currentStep?.index || 0, levelNames.length - 1)]}
        </div>
      </motion.div>

      {/* Gaming Style Progress Bar */}
      <div className="relative">
        {/* Background Bar */}
        <div className="h-6 bg-gray-800 rounded-full border-2 border-gray-600 overflow-hidden shadow-lg">
          {/* Animated Progress Fill */}
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 relative"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          >
            {/* Glowing Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 opacity-60 animate-pulse"></div>
            {/* Shine Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
              animate={{ x: [-100, 300] }}
              transition={{ repeat: Infinity, duration: 2, delay: 1 }}
            />
          </motion.div>
        </div>

        {/* Level Markers */}
        <div className="absolute -bottom-8 w-full flex justify-between text-xs">
          {[1, 2, 3].map((level) => (
            <motion.div
              key={level}
              className={`flex flex-col items-center ${(currentStep?.index || 0) >= level
                ? "text-yellow-400"
                : "text-gray-500"
                }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + level * 0.1 }}
            >
              <div className={`w-3 h-3 rounded-full border-2 ${(currentStep?.index || 0) >= level
                ? "bg-yellow-400 border-yellow-300 shadow-lg shadow-yellow-400/50"
                : "bg-gray-700 border-gray-600"
                } relative`}>
                {(currentStep?.index || 0) >= level && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-yellow-400 animate-ping"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 + level * 0.1 }}
                  />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Gaming Steps with Meme Text */}
      <motion.div
        className="grid grid-cols-3 gap-2 mt-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {[
          { title: "🔌 Connect", subtitle: "Link Up", completed: (currentStep?.index || 0) >= 1 },
          { title: "🔮 Prove", subtitle: "Soul Extract", completed: (currentStep?.index || 0) >= 2 },
          { title: "💎 Mint", subtitle: "Go Brrrr", completed: (currentStep?.index || 0) >= 3 }
        ].map((step, index) => (
          <motion.div
            key={index}
            className={`p-2 rounded-lg border-2 transition-all duration-300 ${step.completed
              ? "border-yellow-400 bg-yellow-400/10 text-yellow-400 shadow-lg shadow-yellow-400/20"
              : "border-gray-600 bg-gray-800/50 text-gray-400"
              }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 + index * 0.1 }}
          >
            <div className="text-sm font-bold">{step.title}</div>
            <div className="text-xs opacity-75">{step.subtitle}</div>
            {step.completed && (
              <motion.div
                className="text-xs text-green-400 mt-1"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + index * 0.1, type: "spring" }}
              >
                ✅ COMPLETE
              </motion.div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Current Step XP Reward */}
      {currentStep?.xpReward && currentStep.xpReward > 0 && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-bold text-sm shadow-lg">
            <span>🎯</span>
            <span>+{currentStep.xpReward} XP REWARD</span>
            <span>⚡</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
