#!/bin/bash

# Kapikol Protocol Deployment Script
# Supports local, devnet, and mainnet deployments with different configurations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CLUSTER=${1:-"localnet"}
SKIP_BUILD=${SKIP_BUILD:-false}

echo -e "${BLUE}🚀 Kapikol Protocol Deployment${NC}"
echo -e "${BLUE}================================${NC}"

# Validate cluster parameter
case $CLUSTER in
  "localnet"|"devnet"|"mainnet")
    echo -e "${GREEN}✅ Deploying to: $CLUSTER${NC}"
    ;;
  *)
    echo -e "${RED}❌ Invalid cluster. Use: localnet, devnet, or mainnet${NC}"
    exit 1
    ;;
esac

# Check if Anchor is installed
if ! command -v anchor &> /dev/null; then
    echo -e "${RED}❌ Anchor CLI not found. Please install Anchor first.${NC}"
    echo -e "${YELLOW}   npm install -g @coral-xyz/anchor-cli${NC}"
    exit 1
fi

# Check if Solana CLI is installed
if ! command -v solana &> /dev/null; then
    echo -e "${RED}❌ Solana CLI not found. Please install Solana first.${NC}"
    exit 1
fi

# Set configuration based on cluster
case $CLUSTER in
  "localnet")
    echo -e "${YELLOW}⚠️  Local deployment - using test parameters${NC}"
    export TEST_EPOCH_DURATION=120  # 2 minutes for testing
    export VERIFICATION_PERIOD=300  # 5 minutes for testing
    export VESTING_DURATION=600     # 10 minutes for testing
    ;;
  "devnet")
    echo -e "${YELLOW}🧪 DevNet deployment - using accelerated parameters${NC}"
    export TEST_EPOCH_DURATION=3600  # 1 hour for devnet testing
    export VERIFICATION_PERIOD=86400 # 1 day for devnet
    export VESTING_DURATION=604800   # 1 week for devnet
    ;;
  "mainnet")
    echo -e "${RED}🔴 MainNet deployment - using production parameters${NC}"
    echo -e "${RED}⚠️  This will deploy with REAL parameters!${NC}"
    read -p "Are you sure you want to deploy to MainNet? (yes/no): " -r
    if [[ ! $REPLY =~ ^yes$ ]]; then
        echo -e "${YELLOW}Deployment cancelled.${NC}"
        exit 0
    fi
    # Production parameters (default values in smart contract)
    ;;
esac

# Set Solana cluster
echo -e "${BLUE}🔧 Setting Solana cluster to $CLUSTER...${NC}"
case $CLUSTER in
  "localnet")
    solana config set --url localhost
    ;;
  "devnet")
    solana config set --url devnet
    ;;
  "mainnet")
    solana config set --url mainnet-beta
    ;;
esac

# Check wallet balance
BALANCE=$(solana balance --lamports 2>/dev/null || echo "0")
MIN_BALANCE=1000000000  # 1 SOL in lamports

if [ "$BALANCE" -lt "$MIN_BALANCE" ]; then
    echo -e "${RED}❌ Insufficient SOL balance: $BALANCE lamports${NC}"
    if [ "$CLUSTER" == "devnet" ]; then
        echo -e "${YELLOW}💰 Requesting DevNet airdrop...${NC}"
        solana airdrop 2
    else
        echo -e "${YELLOW}   Please fund your wallet with at least 1 SOL${NC}"
        exit 1
    fi
fi

# Start local validator if deploying to localnet
if [ "$CLUSTER" == "localnet" ]; then
    echo -e "${BLUE}🏃 Starting local Solana validator...${NC}"
    
    # Kill any existing validator
    pkill -f solana-test-validator || true
    
    # Clean up existing ledger
    rm -rf test-ledger
    
    # Start validator in background
    solana-test-validator --reset --ledger test-ledger > validator.log 2>&1 &
    VALIDATOR_PID=$!
    
    # Wait for validator to start
    echo -e "${YELLOW}⏳ Waiting for validator to start...${NC}"
    sleep 10
    
    # Check if validator is running
    if ! kill -0 $VALIDATOR_PID 2>/dev/null; then
        echo -e "${RED}❌ Failed to start local validator${NC}"
        cat validator.log
        exit 1
    fi
    
    echo -e "${GREEN}✅ Local validator started (PID: $VALIDATOR_PID)${NC}"
fi

# Build the program
if [ "$SKIP_BUILD" != "true" ]; then
    echo -e "${BLUE}🔨 Building Anchor program...${NC}"
    anchor build
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Build failed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${YELLOW}⏭️  Skipping build (SKIP_BUILD=true)${NC}"
fi

# Deploy the program
echo -e "${BLUE}🚀 Deploying program...${NC}"
case $CLUSTER in
  "localnet")
    anchor deploy --provider.cluster localnet
    ;;
  "devnet") 
    anchor deploy --provider.cluster devnet
    ;;
  "mainnet")
    anchor deploy --provider.cluster mainnet
    ;;
esac

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi

# Get program ID
PROGRAM_ID=$(solana address -k target/deploy/kapikol_protocol-keypair.json)
echo -e "${GREEN}✅ Program deployed successfully${NC}"
echo -e "${GREEN}   Program ID: $PROGRAM_ID${NC}"

# Run tests if deploying to localnet
if [ "$CLUSTER" == "localnet" ]; then
    echo -e "${BLUE}🧪 Running tests...${NC}"
    npm run test:local
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ All tests passed${NC}"
    else
        echo -e "${YELLOW}⚠️  Some tests failed, but deployment was successful${NC}"
    fi
fi

# Deployment summary
echo -e "${BLUE}📋 Deployment Summary${NC}"
echo -e "${BLUE}=====================${NC}"
echo -e "${GREEN}✅ Cluster: $CLUSTER${NC}"
echo -e "${GREEN}✅ Program ID: $PROGRAM_ID${NC}"

if [ "$CLUSTER" == "localnet" ]; then
    echo -e "${GREEN}✅ Local validator running (PID: $VALIDATOR_PID)${NC}"
    echo -e "${YELLOW}   Test parameters active:${NC}"
    echo -e "${YELLOW}   - Epoch duration: ${TEST_EPOCH_DURATION:-120} seconds${NC}"
    echo -e "${YELLOW}   - Verification period: ${VERIFICATION_PERIOD:-300} seconds${NC}"
    echo -e "${YELLOW}   - Vesting duration: ${VESTING_DURATION:-600} seconds${NC}"
    echo -e ""
    echo -e "${BLUE}🌐 Frontend Integration:${NC}"
    echo -e "${YELLOW}   Run 'npm run dev' to start the frontend${NC}"
    echo -e "${YELLOW}   The frontend will connect to your local validator${NC}"
    echo -e ""
    echo -e "${BLUE}🛑 To stop the local validator:${NC}"
    echo -e "${YELLOW}   kill $VALIDATOR_PID${NC}"
fi

if [ "$CLUSTER" == "devnet" ]; then
    echo -e "${GREEN}✅ DevNet deployment complete${NC}"
    echo -e "${YELLOW}   Accelerated parameters for testing:${NC}"
    echo -e "${YELLOW}   - Epoch duration: 1 hour${NC}"
    echo -e "${YELLOW}   - Verification period: 1 day${NC}"
    echo -e "${YELLOW}   - Vesting duration: 1 week${NC}"
    echo -e ""
    echo -e "${BLUE}🌐 Frontend Integration:${NC}"
    echo -e "${YELLOW}   Update frontend to point to DevNet${NC}"
    echo -e "${YELLOW}   Program ID: $PROGRAM_ID${NC}"
fi

if [ "$CLUSTER" == "mainnet" ]; then
    echo -e "${GREEN}✅ MainNet deployment complete${NC}"
    echo -e "${RED}🔴 PRODUCTION DEPLOYMENT - REAL MONEY INVOLVED${NC}"
    echo -e "${YELLOW}   Production parameters:${NC}"
    echo -e "${YELLOW}   - Epoch duration: 2 weeks${NC}"
    echo -e "${YELLOW}   - Verification period: 3 months${NC}"
    echo -e "${YELLOW}   - Vesting duration: 3 years${NC}"
    echo -e ""
    echo -e "${RED}⚠️  IMPORTANT: Update all frontend configurations${NC}"
    echo -e "${RED}   Program ID: $PROGRAM_ID${NC}"
fi

echo -e ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo -e "${BLUE}📚 Next steps:${NC}"
echo -e "${YELLOW}   1. Initialize the protocol with appropriate parameters${NC}"
echo -e "${YELLOW}   2. Set up multisig authorities${NC}"
echo -e "${YELLOW}   3. Configure frontend integration${NC}"
echo -e "${YELLOW}   4. Run end-to-end tests${NC}"