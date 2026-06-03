// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract TipJar {
    struct Creator {
        string name;
        string tagline;
        string category;
        bool registered;
        uint256 totalReceived;
        uint256 tipCount;
    }

    mapping(address => Creator) public creators;
    address[] public creatorList;
    mapping(address => bool) public isCreator;
    mapping(address => uint256) public tipsSentCount;
    mapping(address => uint256) public supporterCount;
    mapping(address => mapping(address => bool)) public hasSupported;

    event CreatorRegistered(address indexed creator, string name, string category);
    event TipSent(
        address indexed from,
        address indexed to,
        uint256 amount,
        string message,
        uint256 timestamp
    );

    function registerCreator(
        string calldata name,
        string calldata tagline,
        string calldata category
    ) external {
        require(bytes(name).length > 0, "Name is required");
        require(bytes(tagline).length <= 120, "Tagline is too long");
        require(bytes(category).length > 0, "Category is required");

        Creator storage creator = creators[msg.sender];

        if (!isCreator[msg.sender]) {
            creatorList.push(msg.sender);
            isCreator[msg.sender] = true;
        }

        creator.name = name;
        creator.tagline = tagline;
        creator.category = category;
        creator.registered = true;

        emit CreatorRegistered(msg.sender, name, category);
    }

    function sendTip(address payable creator, string calldata message) external payable {
        require(creator != address(0), "Creator cannot be zero address");
        require(creator != msg.sender, "You cannot tip yourself");
        require(msg.value > 0, "Tip amount must be greater than zero");
        require(bytes(message).length <= 120, "Message is too long");

        Creator storage profile = creators[creator];
        profile.totalReceived += msg.value;
        profile.tipCount += 1;
        tipsSentCount[msg.sender] += 1;

        if (!hasSupported[msg.sender][creator]) {
            hasSupported[msg.sender][creator] = true;
            supporterCount[creator] += 1;
        }

        (bool sent, ) = creator.call{value: msg.value}("");
        require(sent, "ETH transfer failed");

        emit TipSent(msg.sender, creator, msg.value, message, block.timestamp);
    }

    function getCreator(address creator) external view returns (Creator memory) {
        return creators[creator];
    }

    function getCreatorList() external view returns (address[] memory) {
        return creatorList;
    }

    function creatorCount() external view returns (uint256) {
        return creatorList.length;
    }

    function getCreatorAt(uint256 index) external view returns (address) {
        require(index < creatorList.length, "Creator index out of bounds");
        return creatorList[index];
    }

    function getTipsSentCount(address user) external view returns (uint256) {
        return tipsSentCount[user];
    }

    function getSupporterCount(address creator) external view returns (uint256) {
        return supporterCount[creator];
    }

    function hasUserSupported(address supporter, address creator) external view returns (bool) {
        return hasSupported[supporter][creator];
    }
}
