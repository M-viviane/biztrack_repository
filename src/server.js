const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "welcome to biztrack project and it is special project so welcome to biz track again"
  });
});
app.post('/product',(req,res)=>{
  
})



app.listen(5000, () => {
  console.log(`BizTrack server is running on port 5000`);
});