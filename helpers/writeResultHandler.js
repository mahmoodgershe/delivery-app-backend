const AppError = require("./appError");

module.exports = (writeResult, noDocumentMessage, notModifiedMessage) => {
   if (!writeResult.matchedCount) {
      throw new AppError(noDocumentMessage, 404);
   }
   if (!writeResult.modifiedCount) {
      throw new AppError(notModifiedMessage, 402);
   }
};
