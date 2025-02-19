import { Chroma } from "@langchain/community/vectorstores/chroma";
import { OllamaEmbeddings } from "@langchain/ollama";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { getRAGContext } from "./ragProvider";

// 1. 文本预处理（分块）
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 50,
});

const texts = [
  getRAGContext(),
];

const docs = await textSplitter.createDocuments(texts);

// 2. 初始化向量数据库
const vectorStore = await Chroma.fromDocuments(
  docs,
  new OllamaEmbeddings({
    baseUrl: "http://localhost:11434",
    model: "nomic-embed-text",
  }),
  {
    collectionName: "my_documents",
    url: "http://localhost:8000",
  }
);

// 3. 执行相似性搜索
const results = await vectorStore.similaritySearch("查询问题", 5);
console.log(results);
// https://langchain-ai.github.io/langgraphjs/tutorials/quickstart/#next-steps