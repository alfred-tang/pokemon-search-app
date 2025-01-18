const pokeAPI = "https://pokeapi-proxy.freecodecamp.rocks/api/pokemon";

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-button");
const pokemonStats = document.getElementById("pokemon-stats");
const imageOutput = document.getElementById("image-output");
const output = document.getElementById("output");
const list = document.getElementById("list");
const loaderWrapper = document.getElementById("loader-wrapper");

let pokemonData = "";

const formatName = (name) => {
    const specialName = {
        "Mime Jr.": "mime-jr",
        "Mr. Mime": "mr-mime",
        "Mr. Rime": "mr-rime",
        "Ho-oh": "ho-oh",
        "Porygon-Z": "porygon-z",
        "Jangmo-o": "jangmo-o",
        "Hakamo-o": "hakamo-o",
        "Kommo-o": "kommo-o",
        "Wo-Chien": "wo-chien",
        "Chien-Pao": "chien-pao",
        "Ting-Lu": "ting-lu",
        "Chi-Yu": "chi-yu",
    };

    if (Object.values(specialName).includes(name)) {
        return Object.keys(specialName).find((key) => specialName[key] === name);
    } else {
        const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
        const split = capitalized
            .split("-")
            .map((value) => {
                return value.charAt(0).toUpperCase() + value.slice(1);
            })
            .join(" ");

        const gender = (name) => {
            if (name.slice(-2) === " M") {
                return name.slice(0, -2) + " &male;";
            } else if (name.slice(-2) === " F") {
                return name.slice(0, -2) + " &female;";
            } else {
                return name;
            }
        };

        return gender(split);
    }
};

const formatStats = (stats) => {
    const overallStats = {};

    stats.map(({ base_stat, stat }) => {
        const { name } = stat;
        overallStats[name] = base_stat;
    });

    const { hp, attack, defense, speed } = overallStats;
    const spAtk = overallStats["special-attack"];
    const spDef = overallStats["special-defense"];
    const total = hp + attack + defense + speed + spAtk + spDef;

    return { total, hp, attack, defense, speed, spAtk, spDef };
};

const showType = (types) => {
    let pokemonType = "";
    const overallTypes = [];

    types.map(({ type }) => {
        const { name } = type;
        overallTypes.push(name);
    });

    overallTypes.forEach((type) => {
        pokemonType += `<span class="type ${type}">${type.toUpperCase()}</span><br>`;
    });

    return pokemonType;
};

const showSprite = (name, src) => {
    return `<img id="sprite" src="${src}" alt="${name}"/>`;
};

const showPokemon = (data) => {
    const { id, name, weight, height, stats, types, sprites } = data;
    const newName = formatName(name);
    const { total, hp, attack, defense, speed, spAtk, spDef } =
        formatStats(stats);
    const pokemonType = showType(types);
    const { back_default, back_shiny, front_default, front_shiny } = sprites;

    const formatId = String(id).padStart(4, "0");

    const pokemonSprite = showSprite(name, front_default);
    imageOutput.innerHTML = `${pokemonSprite}
        <div id="total-data">
            <span>${pokemonType}</span>
            <span><b>#${formatId}</b></span><hr>
            <span><b>${newName}</b></span><hr>
            <span><b>Weight:</b> ${weight}</span><hr>
            <span><b>Height:</b> ${height}</span>
        </div>
    `;

    output.style.opacity = 1;

    pokemonStats.innerHTML = `
    <tr>
        <td data-label="#" id="pokemon-id">${formatId}</td>
        <td data-label="Name" id="pokemon-name">${newName}</td>
        <td data-label="Weight" id="weight">${weight}</td>
        <td data-label="Height" id="height">${height}</td>
        <td data-label="Types" id="types">${pokemonType}</td>
        <td data-label="Total" id="total"><b>${total}</b></td>
        <td data-label="HP" id="hp">${hp}</td>
        <td data-label="Attack" id="attack">${attack}</td>
        <td data-label="Defense" id="defense">${defense}</td>
        <td data-label="Sp. Atk" id="special-attack">${spAtk}</td>
        <td data-label="Sp. Def" id="special-defense">${spDef}</td>
        <td data-label="Speed" id="speed">${speed}</td>
    </tr>
    `;
};

const fetchPokemon = async (pokemon) => {
    try {
        const res = await fetch(`${pokeAPI}/${pokemon}`);
        const data = await res.json();
        showPokemon(data);
    } catch (err) {
        alert("Pokémon not found");
        console.error(err);
    }
};

const searchPokemon = () => {
    const searchValue = searchInput.value.toLowerCase();
    fetchPokemon(searchValue);
    searchInput.value = "";
    showScreen(pokemonData);
};

const clickItem = () => {
    const items = document.querySelectorAll(".item");

    items.forEach((item) => {
        item.addEventListener("click", () => {
            searchInput.value = item.getAttribute("value");
            searchPokemon();
        });
    });
};

const showScreen = (data) => {
    const searchValue = searchInput.value.toLowerCase();
    const { results } = data;
    const search = {};

    if (searchValue.length !== 0) {
        results.forEach(({ id, name }) => {
            if (name.includes(searchValue) || String(id).includes(searchValue)) {
                search[id] = name;
            }
        });

        const searchId = Object.keys(search);

        if (searchId.length !== 0) {
            list.style.display = "block";
            list.innerHTML = searchId
                .map((id) => {
                    return `
                    <div class="item" value="${search[id]}"><b>${formatName(search[id])}</b> #${String(id).padStart(4, "0")}</div>
                    `;
                })
                .join(" ");
            clickItem();
        } else {
            list.style.display = "none";
        }
    } else {
        list.style.display = "none";
    }
};

const fetchScreen = async () => {
    try {
        const res = await fetch(pokeAPI);
        const data = await res.json();
        pokemonData = data;
        showScreen(pokemonData);
    } catch (err) {
        console.error(err);
    }
};

searchBtn.addEventListener("click", searchPokemon);
window.addEventListener("keydown", ({ key }) => {
    if (key === "Enter") {
        searchPokemon();
    }
});

const fadeOut = () => {
    let interval = setInterval(() => {
        let opacity = loaderWrapper.style.opacity;
        if (opacity > 0) {
            opacity -= 0.1;
            loaderWrapper.style.opacity = opacity;
        } else {
            clearInterval(interval);
            loaderWrapper.style.display = "none";
        }
    }, 1000);
}

window.addEventListener("load", fadeOut);

searchInput.addEventListener("focus", () => {
    if (pokemonData === "") {
        fetchScreen();
    }
});

searchInput.addEventListener("input", () => {
    showScreen(pokemonData);
});

searchInput.addEventListener("keyup", () => {
    showScreen(pokemonData);
});