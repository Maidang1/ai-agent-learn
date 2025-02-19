import ollama from 'ollama';
import { getRAGContext } from './ragProvider';

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


async function run(model: string) {
  // Retrieve context from index.txt for RAG
  // const ragContext = await getRAGContext();
  // Add RAG context as a system message for the model to use
  const messages = [
    // { role: 'system', content: ragContext },
    // { role: 'user', content: 'What is three minus one?' },
    { role: "user", content: "根据许嵩的摄影艺术歌词生成创意性的句子" }
  ];
  // console.log('RAG Context:', ragContext);
  console.log('Prompt:', messages[0].content);

  const availableFunctions = {
    addTwoNumbers: addTwoNumbers,
    subtractTwoNumbers: subtractTwoNumbers,
    getLyric: getLyric
  };

  const response = await ollama.chat({
    model: model,
    messages: messages,
    tools: [addTwoNumbersTool, subtractTwoNumbersTool, getLyricTool]
  });

  let output: number;
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
    console.log('Final response:', marked(finalResponse.message.content));
  } else {
    console.log('No tool calls returned from model');
  }
}

run('llama3.2').catch(error => console.error("An error occurred:", error));