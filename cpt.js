/* =========================
   ELEMENTS
========================= */

const usernameInput =
document.getElementById("usernameInput");

const searchBtn =
document.getElementById("searchBtn");

const profileImage =
document.getElementById("profileImage");

const profileName =
document.getElementById("profileName");

const profileRank =
document.getElementById("profileRank");

const profileLink =
document.getElementById("profileLink");

const rating =
document.getElementById("rating");

const maxRating =
document.getElementById("maxRating");

const contribution =
document.getElementById("contribution");

const friendCount =
document.getElementById("friendCount");

const achievementCard =
document.getElementById("achievementCard");

const historyContainer =
document.getElementById("historyContainer");

const favoritesContainer =
document.getElementById("favoritesContainer");

const saveFavoriteBtn =
document.getElementById("saveFavoriteBtn");

const clearHistoryBtn =
document.getElementById("clearHistoryBtn");

const downloadBtn =
document.getElementById("downloadBtn");

const themeBtn =
document.getElementById("themeBtn");

const toast =
document.getElementById("toast");

let currentUser = null;
let chart;

/* =========================
   TOAST
========================= */

function showToast(msg){

    toast.textContent = msg;
    toast.style.display = "block";

    setTimeout(()=>{
        toast.style.display = "none";
    },3000);
}

/* =========================
   LOADER
========================= */

function showLoader(){
    document.getElementById("loader").style.display="flex";
}

function hideLoader(){
    document.getElementById("loader").style.display="none";
}

/* =========================
   SEARCH USER
========================= */

searchBtn.addEventListener(
"click",
()=>{
    const username =
    usernameInput.value.trim();

    if(!username){
        showToast("Enter username");
        return;
    }

    fetchProfile(username);
}
);

usernameInput.addEventListener(
"keypress",
(e)=>{
    if(e.key==="Enter"){
        searchBtn.click();
    }
}
);

/* =========================
   FETCH PROFILE
========================= */

async function fetchProfile(username){

    try{

        showLoader();

        const res =
        await fetch(
        `https://codeforces.com/api/user.info?handles=${username}`
        );

    

        const data =
        await res.json();

        if(data.status !== "OK"){

            hideLoader();

            showToast(
            "User Not Found"
            );

            return;
        }

        currentUser =
        data.result[0];

        updateProfile();

        saveHistory(username);

        fetchRatingHistory(
        username
        );

    }
    catch(error){

        hideLoader();

        console.error(error);

        showToast(
        "Error fetching profile"
        );
    }
}

/* =========================
   UPDATE PROFILE
========================= */

function updateProfile(){

    profileImage.src =
    currentUser.titlePhoto;

    profileName.textContent =
    currentUser.handle;

    profileRank.textContent =
    currentUser.rank ||
    "Unrated";

    profileLink.href =
    `https://codeforces.com/profile/${currentUser.handle}`;

    rating.textContent =
    currentUser.rating || 0;

    maxRating.textContent =
    currentUser.maxRating || 0;

    contribution.textContent =
    currentUser.contribution || 0;

    friendCount.textContent =
    currentUser.friendOfCount || 0;

    updateAchievement();

}

/* =========================
   ACHIEVEMENT
========================= */

function updateAchievement(){

    const r =
    currentUser.rating || 0;

    let badge = "Newbie 🟢";

    if(r >= 1200)
        badge = "Pupil 🔵";

    if(r >= 1400)
        badge = "Specialist 🟣";

    if(r >= 1600)
        badge = "Expert 🟡";

    if(r >= 1900)
        badge = "Candidate Master 🟠";

    if(r >= 2100)
        badge = "Master 🔴";

    if(r >= 2300)
        badge = "International Master 🏆";

    if(r >= 2400)
        badge = "Grandmaster 👑";

    achievementCard.innerHTML =

    `
    <h3>${badge}</h3>
    <p>
    Rating:
    ${r}
    </p>
    `;
}

/* =========================
   RATING HISTORY
========================= */

async function fetchRatingHistory(handle){

    try{

        const res =
        await fetch(
        `https://codeforces.com/api/user.rating?handle=${handle}`
        );

        const data =
        await res.json();

        hideLoader();

        if(data.status !== "OK"){
            return;
        }

        const labels =
        data.result.map(
        contest =>
        contest.contestName
        );

        const ratings =
        data.result.map(
        contest =>
        contest.newRating
        );

        renderChart(
        labels,
        ratings
        );

    }
    catch(error){

        hideLoader();

        console.error(error);
    }
}

/* =========================
   CHART
========================= */

function renderChart(
labels,
ratings
){

    const ctx =
    document.getElementById(
    "ratingChart"
    );

    if(chart){
        chart.destroy();
    }

    chart =
    new Chart(ctx,{

        type:"line",

        data:{

            labels,

            datasets:[{

                label:
                "Rating Progress",

                data:ratings,

                borderWidth:3,

                fill:false

            }]
        }
    });
}

/* =========================
   SEARCH HISTORY
========================= */

let history =
JSON.parse(
localStorage.getItem(
"history"
)
) || [];

function saveHistory(username){

    history =
    history.filter(
    item =>
    item !== username
    );

    history.unshift(
    username
    );

    history =
    history.slice(0,5);

    localStorage.setItem(
    "history",
    JSON.stringify(history)
    );

    renderHistory();
}

function renderHistory(){

    historyContainer.innerHTML="";

    history.forEach(item=>{

        historyContainer.innerHTML +=

        `
        <div class="history-card">

            <h3>${item}</h3>

        </div>
        `;
    });
}

clearHistoryBtn
.addEventListener(
"click",
()=>{

    history=[];

    localStorage.removeItem(
    "history"
    );

    renderHistory();

    showToast(
    "History Cleared"
    );
}
);

/* =========================
   FAVORITES
========================= */

let favorites =
JSON.parse(
localStorage.getItem(
"favorites"
)
) || [];

saveFavoriteBtn
.addEventListener(
"click",
()=>{

    if(!currentUser){

        showToast(
        "Search profile first"
        );

        return;
    }

    const exists =
    favorites.find(
    item =>
    item.handle ===
    currentUser.handle
    );

    if(exists){

        showToast(
        "Already Added"
        );

        return;
    }

    favorites.push({

        handle:
        currentUser.handle,

        rank:
        currentUser.rank,

        rating:
        currentUser.rating

    });

    localStorage.setItem(
    "favorites",
    JSON.stringify(
    favorites
    )
    );

    renderFavorites();

    showToast(
    "Favorite Saved ❤️"
    );
}
);

function renderFavorites(){

    favoritesContainer.innerHTML="";

    favorites.forEach(user=>{

        favoritesContainer.innerHTML +=

        `
        <div class="favorite-card">

            <h3>
            ${user.handle}
            </h3>

            <p>
            ${user.rank}
            </p>

            <p>
            Rating:
            ${user.rating}
            </p>

        </div>
        `;
    });
}

/* =========================
   DOWNLOAD REPORT
========================= */

downloadBtn.addEventListener(
"click",
()=>{

    if(!currentUser){

        showToast(
        "Search profile first"
        );

        return;
    }

    const report =

`CodeTrack Pro Report

Username: ${currentUser.handle}

Rank: ${currentUser.rank}

Rating: ${currentUser.rating}

Max Rating: ${currentUser.maxRating}

Contribution: ${currentUser.contribution}
`;

    const blob =
    new Blob(
    [report],
    {type:"text/plain"}
    );

    const a =
    document.createElement("a");

    a.href =
    URL.createObjectURL(blob);

    a.download =
    `${currentUser.handle}-report.txt`;

    a.click();

});
/* =========================
   THEME
========================= */

if(
localStorage.getItem(
"theme"
) === "light"
){

    document.body.classList.add(
    "light"
    );

    themeBtn.textContent =
    "☀️";
}

themeBtn.addEventListener(
"click",
()=>{

    document.body.classList.toggle(
    "light"
    );

    if(
    document.body.classList.contains(
    "light"
    )
    ){

        localStorage.setItem(
        "theme",
        "light"
        );

        themeBtn.textContent =
        "☀️";

    }else{

        localStorage.setItem(
        "theme",
        "dark"
        );

        themeBtn.textContent =
        "🌙";
    }
});

/* =========================
   INIT
========================= */

renderHistory();
renderFavorites();
hideLoader();