import React from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";

class JokeList extends React.Component {
  constructor(props) {
    super(props);
    this.numJokesToGet = 10;
    this.state = { jokes: [] };
    this.vote = this.vote.bind(this);
    this.generateNewJokes = this.generateNewJokes.bind(this);
  }

  /* get jokes if there are no jokes */
  componentDidMount() {
    if (this.state.jokes.length === 0) this.getJokes();
  }

  componentDidUpdate() {
    if (this.state.jokes.length < this.numJokesToGet) this.getJokes();
  }

  getJokes = async () => {
    let j = [...this.state.jokes];
    let jokeVotes = {};
    let seenJokes = new Set(j.map((jk) => jk.id));

    try {
      while (j.length < this.numJokesToGet) {
        let res = await axios.get("https://icanhazdadjoke.com", {
          headers: { Accept: "application/json" },
        });
        let { status, ...jokeObj } = res.data;

        if (!seenJokes.has(jokeObj.id)) {
          seenJokes.add(jokeObj.id);
          jokeVotes[jokeObj.id] = jokeVotes[jokeObj.id] || 0;
          j.push({ ...jokeObj, votes: jokeVotes[jokeObj.id] });
        } else {
          console.error("duplicate found!");
        }
      }
      this.setState({ jokes: j });
      // window.localStorage.setItem("jokeVotes", JSON.stringify(jokeVotes));
    } catch (e) {
      console.log(e);
    }
  };

  /* empty joke list and then call getJokes */
  generateNewJokes() {
    this.setState({ jokes: [] });
  }

  /* change vote for this id by delta (+1 or -1) */
  vote(id, delta) {
    let newJokes = this.state.jokes.map((j) =>
      j.id === id ? { ...j, votes: j.votes + delta } : j
    );

    this.setState({ jokes: newJokes });
  }

  /* render: list of sorted jokes. */
  render() {
    if (this.state.jokes.length) {
      let sortedJokes = [...this.state.jokes].sort((a, b) => b.votes - a.votes);

      return (
        <div className="JokeList">
          <button className="JokeList-getmore" onClick={this.generateNewJokes}>
            Get New Jokes
          </button>

          {sortedJokes.map((j) => (
            <Joke
              text={j.joke}
              key={j.id}
              id={j.id}
              votes={j.votes}
              vote={this.vote}
            />
          ))}
        </div>
      );
    }
    return null;
  }
}

export default JokeList;
