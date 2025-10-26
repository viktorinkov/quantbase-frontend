const fetch = require('node-fetch');

async function testAPI() {
  try {
    const response = await fetch('http://localhost:3000/api/user/portfolio?username=demo');
    const data = await response.json();

    console.log('API Response Summary:');
    console.log('- Success:', data.success);
    console.log('- Current Model:', data.portfolio.current_model);
    console.log('- Total Trades:', data.portfolio.total_trades);
    console.log('- Trades array length:', data.portfolio.trades.length);

    if (data.portfolio.trades.length > 0) {
      console.log('\nFirst trade:');
      console.log(JSON.stringify(data.portfolio.trades[0], null, 2));

      console.log('\nLast trade:');
      console.log(JSON.stringify(data.portfolio.trades[data.portfolio.trades.length - 1], null, 2));
    }

    console.log('\nBalances:', data.portfolio.balances);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();
