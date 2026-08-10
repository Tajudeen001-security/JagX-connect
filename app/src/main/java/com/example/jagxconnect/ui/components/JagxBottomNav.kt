package com.example.jagxconnect.ui.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag

enum class NavDestination(
    val title: String,
    val selectedIcon: @Composable () -> Unit,
    val unselectedIcon: @Composable () -> Unit
) {
    Feed("Feed", { Icon(Icons.Filled.Home, "Feed") }, { Icon(Icons.Outlined.Home, "Feed") }),
    Reels("Reels", { Icon(Icons.Filled.Movie, "Reels") }, { Icon(Icons.Outlined.Movie, "Reels") }),
    Live("Live", { Icon(Icons.Filled.LiveTv, "Live") }, { Icon(Icons.Outlined.LiveTv, "Live") }),
    Marketplace("Market", { Icon(Icons.Filled.Storefront, "Marketplace") }, { Icon(Icons.Outlined.Storefront, "Marketplace") }),
    Chat("Chat", { Icon(Icons.Filled.Chat, "Chat") }, { Icon(Icons.Outlined.Chat, "Chat") }),
    Wallet("Coins", { Icon(Icons.Filled.AccountBalanceWallet, "Coins") }, { Icon(Icons.Outlined.AccountBalanceWallet, "Coins") }),
    Invest("Invest", { Icon(Icons.Filled.CreditCard, "Invest") }, { Icon(Icons.Outlined.CreditCard, "Invest") }),
    Profile("Profile", { Icon(Icons.Filled.Person, "Profile") }, { Icon(Icons.Outlined.Person, "Profile") })
}

@Composable
fun JagxBottomNav(
    currentDestination: NavDestination,
    onDestinationSelected: (NavDestination) -> Unit
) {
    NavigationBar(
        modifier = Modifier.testTag("bottom_nav"),
        containerColor = MaterialTheme.colorScheme.surface,
        tonalElevation = NavigationBarDefaults.Elevation
    ) {
        NavDestination.values().forEach { destination ->
            val isSelected = currentDestination == destination
            NavigationBarItem(
                selected = isSelected,
                onClick = { onDestinationSelected(destination) },
                icon = { if (isSelected) destination.selectedIcon() else destination.unselectedIcon() },
                label = { Text(destination.title, style = MaterialTheme.typography.labelSmall) },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = MaterialTheme.colorScheme.primary,
                    selectedTextColor = MaterialTheme.colorScheme.primary,
                    indicatorColor = MaterialTheme.colorScheme.surfaceVariant
                )
            )
        }
    }
}
