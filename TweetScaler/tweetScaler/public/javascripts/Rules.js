const buttonPress = async (event) => {
    let search = document.getElementById("search").value;
    try {
        const eventResponse = await fetch('/twitter');
        if (eventResponse.status === 200 || 304) {
            const res = await eventResponse.json();
            //console.log(res);
        }
        else {
            console.log("response error")
        }
    } catch (err) {
        console.log(err)
    }
};

const button = document.getElementsByClassName("srcBtn")[0].addEventListener("click", (e) => buttonPress(e));
