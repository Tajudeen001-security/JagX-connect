package com.example.jagxconnect.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CoinsWalletScreen(
    userCoins: Int,
    onBuyCoins: (Int, Double) -> Unit
) {
    val packages = listOf(
        Pair(250, 2.99),
        Pair(1000, 9.99),
        Pair(2800, 24.99),
        Pair(12000, 99.99)
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("JagX Coin Wallet", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Balance Card
            item {
                Card(
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primary),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text("Available JagX Coins", fontSize = 14.sp, fontWeight = FontWeight.Medium, color = Color.Black.copy(0.7f))
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("🪙", fontSize = 32.sp)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("$userCoins", fontSize = 36.sp, fontWeight = FontWeight.Bold, color = Color.Black)
                        }
                        Spacer(modifier = Modifier.height(12.dp))
                        Text("Use coins to gift post creators, support live streams, or unlock VIP perks.", fontSize = 12.sp, color = Color.Black.copy(0.8f))
                    }
                }
            }

            item {
                Text("Top Up Coins", fontWeight = FontWeight.Bold, fontSize = 18.sp)
            }

            // Packages list
            items(packages.size) { index ->
                val pkg = packages[index]
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    elevation = CardDefaults.cardElevation(2.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text("🪙 ${pkg.first} Coins", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                                if (pkg.first >= 2800) {
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Surface(shape = RoundedCornerShape(6.dp), color = Color.Red) {
                                        Text("POPULAR", color = Color.White, fontSize = 9.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                                    }
                                }
                            }
                            Text("Instant delivery to your wallet", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface.copy(0.6f))
                        }

                        Button(
                            onClick = { onBuyCoins(pkg.first, pkg.second) },
                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                        ) {
                            Text("\$${pkg.second}", color = Color.Black, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}
