import type { NextPage } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";

const Game = dynamic(() => import("../components/Game"), {
  ssr: false,
});
const Home: NextPage = () => {
  return (
    <>
      <Game />
    </>
  );
};

export default Home;
