import ollama from 'ollama';
import { getRAGContext } from './ragProvider';
import readline from 'readline';
import { handleConversation } from './embed';

import { marked } from 'marked';
import { markedTerminal } from 'marked-terminal';


marked.use(markedTerminal)
// Add two numbers function
function addTwoNumbers(args: { a: number, b: number }): number {
  return args.a + args.b;
}

// Subtract two numbers function 
function subtractTwoNumbers(args: { a: number, b: number }): number {
  return args.a - args.b;
}

function multiplyTwoNumbers(args: { a: number, b: number }): number {
  return args.a * args.b
}

function divideTwoNumbers(args: { a: number, b: number }): number {
  return args.a / args.b
}

function getLyric(args: { author: string, name: string }) {
  return getRAGContext()
}



// Tool definition for add function
const addTwoNumbersTool = {
  type: 'function',
  function: {
    name: 'addTwoNumbers',
    description: 'Add two numbers together',
    parameters: {
      type: 'object',
      required: ['a', 'b'],
      properties: {
        a: { type: 'number', description: 'The first number' },
        b: { type: 'number', description: 'The second number' }
      }
    }
  }
};

// Tool definition for subtract function
const subtractTwoNumbersTool = {
  type: 'function',
  function: {
    name: 'subtractTwoNumbers',
    description: 'Subtract two numbers',
    parameters: {
      type: 'object',
      required: ['a', 'b'],
      properties: {
        a: { type: 'number', description: 'The first number' },
        b: { type: 'number', description: 'The second number' }
      }
    }
  }
};

// Tool definition for multiply function
const multiplyTwoNumbersTool = {
  type: 'function',
  function: {
    name: 'multiplyTwoNumbers',
    description: 'Multiply two numbers',
    parameters: {
      type: 'object',
      required: ['a', 'b'],
      properties: {
        a: { type: 'number', description: 'The first number' },
        b: { type: 'number', description: 'The second number' }
      }
    }
  }
};

// Tool definition for divide function
const divideTwoNumbersTool = {
  type: 'function',
  function: {
    name: 'divideTwoNumbers',
    description: 'Divide first number by second number',
    parameters: {
      type: 'object',
      required: ['a', 'b'],
      properties: {
        a: { type: 'number', description: 'The dividend' },
        b: { type: 'number', description: 'The divisor' }
      }
    }
  }
};


const getLyricTool = {
  type: 'function',
  function: {
    name: 'getLyric',
    description: '获取歌词',
    parameters: {
      type: 'object',
      required: ['author', 'name'],
      properties: {
        author: { type: 'string', description: 'The author name' },
        name: { type: 'string', description: 'The song name' }
      }
    }
  }
};

// Function to read input from terminal
function readUserInput(promptText: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => {
    rl.question(promptText, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

async function generateEmbeddings(text: string) {
  try {
    const response = await ollama.embeddings({
      model: "nomic-embed-text",  // 或其他支持 embeddings 的模型
      prompt: text
    });
    return response;
  } catch (error) {
    console.error("Error generating embeddings:", error);
    throw error;
  }
}




async function run(model: string) {
  try {
    // Read user prompt from terminal
    // const userPrompt = await readUserInput("请输入用户提示: ");
    // Initialize messages for this iteration

    // 调用 handleConversation 函数并获取结果
    const conversationResult = await handleConversation("面朝大海");

    const messages = [
      { role: "user", content: "摄影艺术歌词是啥" },
      { role: "assistant", content: JSON.stringify(conversationResult) }
    ];
    console.log('Prompt:', messages[0].content);

    const availableFunctions = {
      addTwoNumbers: addTwoNumbers,
      subtractTwoNumbers: subtractTwoNumbers,
      // getLyric: getLyric,
      multiplyTwoNumbers: multiplyTwoNumbers,
      divideTwoNumbers

    };

    const response = await ollama.chat({
      model: model,
      messages: messages,
      tools: [
        addTwoNumbersTool,
        subtractTwoNumbersTool,
        getLyricTool,
        multiplyTwoNumbersTool, divideTwoNumbersTool
      ]
    });

    let output: number;
    console.log("response.message.tool_calls", response.message.tool_calls)
    if (response.message.tool_calls) {
      // Process tool calls from the response
      for (const tool of response.message.tool_calls) {
        const functionToCall = availableFunctions[tool.function.name];
        if (functionToCall) {
          console.log('Calling function:', tool.function.name);
          console.log('Arguments:', tool.function.arguments);
          output = functionToCall(tool.function.arguments);
          console.log('Function output:', output);

          // Add the function response to messages for the model to use
          messages.push(response.message);
          messages.push({
            role: 'tool',
            content: output.toString(),
          });
        } else {
          console.log('Function', tool.function.name, 'not found');
        }
      }

      // Get final response from model with function outputs
      const finalResponse = await ollama.chat({
        model: model,
        messages: messages
      });
      console.log('Final response:', finalResponse.message.content);
    } else {
      console.log(response.message);
    }

    // Loop continues for next input; use ctrl+c to exit
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

run('llama3.2').catch(error => console.error("An error occurred:", error));