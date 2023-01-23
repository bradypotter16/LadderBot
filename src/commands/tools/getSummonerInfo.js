const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { riotapi } = process.env;
require('dotenv').config();

async function getBasicInfo(summonerName)
{
    
    var url = `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${riotapi}`;

    const myData = await fetch(url);
    const response = await myData.json();
    
    return response;
    
}

async function getRankInfo(summonerID)
{

    var url = `https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerID}?api_key=${riotapi}`

    const myData = await fetch(url);
    const response = await myData.json();

    return response;

}

async function getTftInfo(summonerID)
{

    var url = `https://na1.api.riotgames.com/tft/league/v1/entries/by-summoner/${summonerID}?api_key=${riotapi}`

    const myData = await fetch(url);
    const response = await myData.json();

    return response;

}

function createRankList(lolData, tftData)
{

    let rankList = [

        "No data available.\nEnsure placements are completed.",
        "No data available.\nEnsure placements are completed.",
        "No data available.\nEnsure placements are completed.",
        "No data available.\nEnsure placements are completed.",
        "No data available.\nEnsure placements are completed."

    ]

    for (var i = 0; i < lolData.length; i++) {

        if (lolData[i].queueType == 'RANKED_SOLO_5x5')
        {

            rankName = lolData[i].tier.toLowerCase();
            rankName = rankName.charAt(0).toUpperCase() + rankName.slice(1);

            winrate = ((lolData[i].wins / (lolData[i].losses + lolData[i].wins))*100).toFixed(2);

            rankList[0] = `${rankName} ${lolData[i].rank} ${lolData[i].leaguePoints} LP\n${lolData[i].wins} wins, ${lolData[i].losses} losses, ${winrate}% winrate` 
            
        }

        else if (lolData[i].queueType == 'RANKED_FLEX_SR')
        {

            rankName = lolData[i].tier.toLowerCase();
            rankName = rankName.charAt(0).toUpperCase() + rankName.slice(1);

            winrate = ((lolData[i].wins / (lolData[i].losses + lolData[i].wins))*100).toFixed(2);

            rankList[1] = `${rankName} ${lolData[i].rank} ${lolData[i].leaguePoints} LP\n${lolData[i].wins} wins, ${lolData[i].losses} losses, ${winrate}% winrate` 
            
        }

        else if (lolData[i].queueType == 'RANKED_TFT_DOUBLE_UP')
        {

            rankName = lolData[i].tier.toLowerCase();
            rankName = rankName.charAt(0).toUpperCase() + rankName.slice(1);

            winrate = ((lolData[i].wins / (lolData[i].losses + lolData[i].wins))*100).toFixed(2);

            rankList[3] = `${rankName} ${lolData[i].rank} ${lolData[i].leaguePoints} LP\n${lolData[i].wins} wins, ${lolData[i].losses} losses, ${winrate}% winrate` 
            
        }

    }

    for (var i = 0; i < tftData.length; i++) {

        if (tftData[i].queueType == 'RANKED_TFT')
        {

            rankName = tftData[i].tier.toLowerCase();
            rankName = rankName.charAt(0).toUpperCase() + rankName.slice(1);

            winrate = ((tftData[i].wins / (tftData[i].losses + tftData[i].wins))*100).toFixed(2);

            rankList[2] = `${rankName} ${tftData[i].rank} ${tftData[i].leaguePoints} LP\n${tftData[i].wins} wins, ${tftData[i].losses} losses, ${winrate}% winrate` 
            
        }

        else if (tftData[i].queueType == 'RANKED_TFT_TURBO')
        {

            rankName = tftData[i].ratedTier.toLowerCase();
            rankName = rankName.charAt(0).toUpperCase() + rankName.slice(1);

            winrate = ((tftData[i].wins / (tftData[i].losses + tftData[i].wins))*100).toFixed(2);

            rankList[4] = `${tftData[i].ratedRating} rating (${rankName} tier)\n${tftData[i].wins} wins, ${tftData[i].losses} losses, ${winrate}% winrate` 
            
        }

    }

    return rankList;

}

module.exports = {

    data: new SlashCommandBuilder()
        .setName('getsummonerinfo')
        .setDescription('Returns information about the entered summoner name')
        .addStringOption(option =>
            option
            .setName('summoner')
            .setDescription('Name of chosen summoner')
            .setRequired(true)),
  
        async execute(interaction, client) {

            const message = await interaction.deferReply({

                fetchReply: true

            });
  
            const sumName = interaction.options.getString("summoner");
            const basicData = await(getBasicInfo(sumName));
            const summonerID = basicData.id;

            const rankData = await(getRankInfo(summonerID));
            const tftData = await(getTftInfo(summonerID));

            rankList = createRankList(rankData, tftData);

            const embed = new EmbedBuilder()
                .setTitle(basicData.name)
                .setDescription("[links coming soon]")
                .setThumbnail(client.user.displayAvatarURL())
                .setColor('#004EFF')
                .setTimestamp(Date.now())
                .addFields([

                    {
                        name: `Ranked Solo/Duo`,
                        value: rankList[0],
                        inline: false
                    },
                    {
                        name: `Ranked Flex`,
                        value: rankList[1],
                        inline: false
                    },
                    {
                        name: `TFT Solo`,
                        value: rankList[2],
                        inline: false
                    },
                    {
                        name: `TFT Double Up`,
                        value: rankList[3],
                        inline: false
                    },
                    {
                        name: `TFT Hyperroll`,
                        value: rankList[4],
                        inline: false
                    }

                ]);

            await interaction.editReply({

                embeds: [embed]

            });

        }

}