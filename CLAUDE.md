# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the Kapikol webapp repository - a SocialFi platform for micro-influencer tokenization and brand activation on Solana. The project enables fans to launch tokens for influencers, stake on rising creators, and provides brands with analytics to discover high-ROI micro-influencers.

## Project Purpose

Kapikol is a comprehensive platform that:
- Allows fan-initiated token launches for creators
- Uses staking to rank KOLs (Key Opinion Leaders) 
- Provides AI-powered growth verification and ranking
- Offers brand analytics for micro-influencer discovery and activation
- Built on Solana for low-cost, high-throughput token operations

Key stakeholders:
- **Fans**: Launch and stake on creator tokens
- **Influencers**: Monetize influence earlier through tokenization
- **Brands**: Access verified micro-influencer performance data
- **Investors**: Exposure to SocialFi + influencer economy

## Current State

The repository is in initial setup phase with:
- PROJECT.md: Comprehensive project specification and tokenomics
- README.md: Basic project description
- .gitignore: Standard Node.js/web development patterns

## Development Architecture

Based on the project requirements, the webapp will need:

### Core Components
- **Token Launch Interface**: Fan-initiated creator token proposals
- **Staking System**: SOL staking for KOL ranking and allocation
- **Creator Dashboard**: Identity verification, content tracking, reward management
- **Brand Analytics Suite**: Micro-influencer discovery and campaign management
- **AI Ranking Oracle**: Growth verification and performance scoring

### Technical Requirements
- Solana blockchain integration for token operations
- Social media API integrations (Twitter/X, YouTube, Instagram, TikTok, Telegram)
- Real-time analytics and ranking systems
- Multi-platform content verification
- Anti-gaming and fraud detection

### Platform Focus
- Initial focus: Female influencers in Japan (beauty/fashion verticals)
- Micro-influencer emphasis over mega-influencers for better ROI
- Cross-platform content strategy optimization

## Development Setup

When initializing this project, you'll need:
1. Set up Solana Web3.js integration
2. Configure social media API connections
3. Implement real-time data processing for ranking oracle
4. Set up analytics dashboard framework
5. Configure multi-platform authentication and verification

The .gitignore is configured for Node.js/web frameworks, indicating a JavaScript/TypeScript stack suitable for Web3 development.