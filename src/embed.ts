import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OllamaEmbeddings } from "@langchain/ollama";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { getRAGContext } from "./ragProvider";

// 1. 文本预处理（分块）


// 3. 执行相似性搜索
// const results = await vectorStore.similaritySearch("面朝大海", 1);

// 4. 使用 retriever 调用
// const retriever = vectorStore.asRetriever({
//   searchType: "mmr", // 使用 MMR 搜索类型
//   k: 1, // 返回的结果数量
// });
// const resultAsRetriever = await retriever.invoke("面朝大海");
// console.log("resultAsRetriever", resultAsRetriever);

// 添加一个新的函数来处理对话
async function handleConversation(query) {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 100,
  });

  const texts = [
    getRAGContext(),
  ];

  const docs = await textSplitter.createDocuments(texts);

  // 2. 初始化内存向量存储
  const vectorStore = new MemoryVectorStore(new OllamaEmbeddings({
    model: "nomic-embed-text",
  }));

  await vectorStore.addDocuments(docs);
  // 使用 retriever 调用
  const retriever = vectorStore.asRetriever({
    searchType: "mmr", // 使用 MMR 搜索类型
    k: 1, // 返回的结果数量
  });

  const resultAsRetriever = await retriever.invoke(query);
  console.log("resultAsRetriever", resultAsRetriever);

  // 在这里可以将 resultAsRetriever 集成到对话逻辑中
  // 例如，返回结果或进一步处理
  return resultAsRetriever;
}

export { handleConversation }
// 调用新的对话处理函数
// const conversationResult = await handleConversation("面朝大海");
// console.log("Conversation Result:", conversationResult);