// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {SiweAuth} from "@oasisprotocol/sapphire-contracts/contracts/auth/SiweAuth.sol";

contract Battleship is SiweAuth {
    event GamePending(uint256 indexed gameId, address player1);
    event GameStarted(uint256 indexed gameId, address player1, address player2);
    event AttackResult(uint256 indexed gameId, address attacker, uint256 index, bool isHit);
    event GameWon(uint256 indexed gameId, address winner);

    struct Game {
        address payable player1;
        address payable player2;
        uint256 ships1;
        uint256 ships2;
        uint256 hits1;
        uint256 hits2;
        address currentPlayer;
        bool gameOver;
        uint256 bet;
    }

    mapping(uint256 => Game) public games;

    constructor(string memory domain) SiweAuth(domain) {}

    function getGameStatus(
        uint256 gameId
    )
        external
        view
        returns (address player1, address player2, address currentPlayer, bool gameOver)
    {
        Game storage game = games[gameId];
        player1 = game.player1;
        player2 = game.player2;
        currentPlayer = game.currentPlayer;
        gameOver = game.gameOver;
    }

    function getHits(uint256 gameId, address player) external view returns (uint256) {
        if (player == games[gameId].player1) {
            return games[gameId].hits1;
        } else if (player == games[gameId].player2) {
            return games[gameId].hits2;
        }
        revert("Ivalid player");
    }

    function getShips(uint256 gameId, bytes memory authToken) external view returns (uint256) {
        if (authMsgSender(authToken) == games[gameId].player1) {
            return games[gameId].ships1;
        } else if (authMsgSender(authToken) == games[gameId].player2) {
            return games[gameId].ships2;
        }
        revert("Not allowed");
    }

    function createGame(uint256 gameId, uint256 ships) external payable {
        require(msg.value == 5 ether, "Player must bet 5 tokens");
        require(games[gameId].player1 == address(0), "Game ID already in use");

        games[gameId] = Game(
            payable(msg.sender),
            payable(address(0)),
            ships,
            0,
            0,
            0,
            msg.sender,
            false,
            5 ether
        );
        emit GamePending(gameId, msg.sender);
    }

    function joinGame(uint256 gameId, uint256 ships) external payable {
        require(msg.value == 5 ether, "Player must bet 5 tokens");
        Game storage game = games[gameId];
        require(game.player1 != address(0), "Game does not exist");
        require(game.player2 == address(0), "Game already has two players");
        require(game.player1 != msg.sender, "Cannot join your own game");

        game.player2 = payable(msg.sender);
        game.ships2 = ships;

        emit GameStarted(gameId, game.player1, game.player2);
    }

    function attack(uint256 gameId, uint256 index) external {
        Game storage game = games[gameId];
        require(!game.gameOver, "Game over");
        require(msg.sender == game.currentPlayer, "Not your turn");
        require(index < 36, "Invalid index");

        uint256 reverseIndex = 35 - index;
        uint256 mask = 1 << reverseIndex;
        bool isHit;

        if (msg.sender == game.player1) {
            require(((game.hits2) & mask) == 0, "Already attacked");
            isHit = (game.ships2 & mask) != 0;

            if (isHit) {
                game.hits2 |= mask;
            }
            game.currentPlayer = game.player2;
        } else if (msg.sender == game.player2) {
            require(((game.hits1) & mask) == 0, "Already attacked");
            isHit = (game.ships1 & mask) != 0;

            if (isHit) {
                game.hits1 |= mask;
            }
            game.currentPlayer = game.player1;
        }

        if ((game.hits2 == game.ships2) || (game.hits1 == game.ships1)) {
            game.gameOver = true;

            address payable winner = payable(msg.sender);
            winner.transfer(2 * game.bet);

            emit GameWon(gameId, winner);
        }

        emit AttackResult(gameId, msg.sender, index, isHit);
    }
}
