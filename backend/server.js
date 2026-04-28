require('dotenv').config();
const { app, connectToDatabase } = require('./src/app');

const PORT = process.env.PORT || 3001;

connectToDatabase()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error('MongoDB connection error', error);
    process.exit(1);
  });

