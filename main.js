const OpenAI = require("openai");
const axios = require('axios');
const openai = new OpenAI({apiKey: 'apikey here'});

async function fetchArticles(userInputString){
    //userInputString = apple, tesla, google
    userInputString = userInputString.replace(/\s/g, '');
    let keywords = userInputString.split(',');
    let keywordObjects = keywords.map((keyword) => ({q: keyword}));
    let formattedArticles = [];
    let newsArticles = [];
    // let data = JSON.stringify([
    //     {
    //       "q": "apple"
    //     },
    //     {
    //       "q": "google inc"
    //     },
    //     {
    //       "q": "tesla inc"
    //     }
    //   ]);
    let data = JSON.stringify(keywordObjects);
      
      let config = {
        method: 'post',
        url: 'https://google.serper.dev/news',
        headers: { 
          'X-API-KEY': '0b9ee18c8d107b60abee9d27a9677faf23059183', 
          'Content-Type': 'application/json'
        },
        data : data
      };
      
      axios(config)
      .then((response) => {
        //console.log(JSON.stringify(response.data));
        formattedArticles = response.data;

        //tidy up the results
    newsArticles = formattedArticles.flatMap(item => item.news.map(article => ({
        title: article.title,
        link: article.link,
        snippet: article.snippet,
        date: article.date,
        source: article.source
    })));
    //console.log(newsArticles);
      })
      .catch((error) => {
        console.log(error);
      }).finally(async() => {
                // Format the information into a string
                const messages = newsArticles.map((article, index) => ({
                    role: 'system',
                    content: `Article ${index + 1}: ${article.title} from ${article.source} on ${article.date}. ${article.snippet}. Read more: ${article.link}`,
                }));
                console.log(messages);
            
                // Add a user message to ask GPT-3 to summarize the articles
                messages.push({
                    role: 'user',
                    content: `Group the articles by topic. Make sure the "Read more: " of each article is included. The topics are ${userInputString}.`
                });
            
                // Use the messages as input to GPT-3
                const response = await openai.chat.completions.create({
                    model: 'gpt-3.5-turbo',
                    messages: messages
                });
            
                // Print the model's response
                console.log(response.choices[0].message.content);
      });


}
async function main() {
fetchArticles("Inflation Philippines, Prices of white rice in the Philippines, Christmas");
}

main();