import dotenv from "dotenv";
import app from "./app.js";
import startWorker from "./workers/jobWorker.js";

dotenv.config();

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);

    startWorker().catch((error) => {
        console.error("Worker crashed:", error);
    });
});