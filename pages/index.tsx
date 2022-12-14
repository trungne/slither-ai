import type { NextPage } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";

const Game = dynamic(() => import("../components/Game"), {
  ssr: false,
});
const Home: NextPage = () => {
  return (
    <>
     <Head>
        <title>Slither AI</title>
        <meta name="description" content="Like snake but with AI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Game />
    </>
  );
};

export default Home;
