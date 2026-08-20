// Generates a short, human-readable, sufficiently-unique PNR like "SB8F92K1"
const generatePNR = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusing 0/O/1/I
  let code = "SB";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

module.exports = generatePNR;
