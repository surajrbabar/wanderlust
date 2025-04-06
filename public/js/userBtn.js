let userBtn = document.getElementById("user-btn");
    userBtn.addEventListener("click", () => {
    
        let userWindow = document.getElementById("user-window");
        if(userWindow.style.display !== "flex"){
          userWindow.style.display = "flex";
        }else{
          userWindow.style.display = "none";
        }
      
    })