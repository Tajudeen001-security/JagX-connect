package com.example.jagxconnect

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.jagxconnect.data.model.Conversation
import com.example.jagxconnect.data.repository.JagxRepository
import com.example.jagxconnect.ui.components.JagxBottomNav
import com.example.jagxconnect.ui.components.NavDestination
import com.example.jagxconnect.ui.components.VideoCallModal
import com.example.jagxconnect.ui.screens.*
import com.example.jagxconnect.ui.theme.JagXTheme

sealed class ActiveView {
    data class Main(val destination: NavDestination) : ActiveView()
    data class DM(val conversation: Conversation) : ActiveView()
    object Notifications : ActiveView()
    object Settings : ActiveView()
}

data class ActiveCallState(
    val partnerName: String,
    val partnerAvatar: String,
    val isVideo: Boolean
)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val repository = JagxRepository(applicationContext)

        setContent {
            val user by repository.currentUser.collectAsStateWithLifecycle()
            val posts by repository.postsFlow.collectAsStateWithLifecycle(initialValue = emptyList())
            val stories by repository.stories.collectAsStateWithLifecycle()
            val reels by repository.reels.collectAsStateWithLifecycle()
            val liveRooms by repository.liveRooms.collectAsStateWithLifecycle()
            val conversations by repository.conversations.collectAsStateWithLifecycle()
            val products by repository.productsFlow.collectAsStateWithLifecycle(initialValue = emptyList())
            val investments by repository.investments.collectAsStateWithLifecycle()
            val memberCard by repository.memberCard.collectAsStateWithLifecycle()
            val notifications by repository.notifications.collectAsStateWithLifecycle()
            val accentTheme by repository.accentTheme.collectAsStateWithLifecycle()

            var activeView by remember { mutableStateOf<ActiveView>(ActiveView.Main(NavDestination.Feed)) }
            var activeCall by remember { mutableStateOf<ActiveCallState?>(null) }

            JagXTheme(accentTheme = accentTheme) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    Box(modifier = Modifier.fillMaxSize()) {
                        Scaffold(
                            bottomBar = {
                                if (activeView is ActiveView.Main) {
                                    JagxBottomNav(
                                        currentDestination = (activeView as ActiveView.Main).destination,
                                        onDestinationSelected = { activeView = ActiveView.Main(it) }
                                    )
                                }
                            }
                        ) { innerPadding ->
                            Box(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(innerPadding)
                            ) {
                                when (val view = activeView) {
                                    is ActiveView.Main -> {
                                        when (view.destination) {
                                            NavDestination.Feed -> FeedScreen(
                                                posts = posts,
                                                stories = stories,
                                                userCoins = user.coinsBalance,
                                                onLikeToggle = { id, liked -> repository.toggleLikePost(id, liked) },
                                                onSaveToggle = { id, saved -> repository.toggleSavePost(id, saved) },
                                                onSendGift = { postId, amount ->
                                                    val success = repository.sendCoinsToPost(postId, amount)
                                                    if (success) {
                                                        Toast.makeText(applicationContext, "Sent $amount JagX Coins!", Toast.LENGTH_SHORT).show()
                                                    } else {
                                                        Toast.makeText(applicationContext, "Insufficient Coin Balance!", Toast.LENGTH_SHORT).show()
                                                    }
                                                },
                                                onCreatePost = { text, img -> repository.createPost(text, img) },
                                                onOpenNotifications = { activeView = ActiveView.Notifications }
                                            )
                                            NavDestination.Reels -> ReelsScreen(
                                                reels = reels,
                                                userCoins = user.coinsBalance,
                                                onSendGiftToCreator = { creatorId, amount ->
                                                    Toast.makeText(applicationContext, "Gifted $amount Coins to creator!", Toast.LENGTH_SHORT).show()
                                                }
                                            )
                                            NavDestination.Live -> LiveScreen(
                                                liveRooms = liveRooms,
                                                userCoins = user.coinsBalance,
                                                onSendGiftToHost = { hostId, amount ->
                                                    Toast.makeText(applicationContext, "Gifted $amount Coins to host!", Toast.LENGTH_SHORT).show()
                                                }
                                            )
                                            NavDestination.Marketplace -> MarketplaceScreen(
                                                products = products,
                                                userCoins = user.coinsBalance,
                                                onCreateListing = { t, d, c, u, cat, img ->
                                                    repository.createListing(t, d, c, u, cat, img)
                                                    Toast.makeText(applicationContext, "Listing Published!", Toast.LENGTH_SHORT).show()
                                                },
                                                onBuyProduct = { item ->
                                                    Toast.makeText(applicationContext, "Order placed for ${item.title}!", Toast.LENGTH_LONG).show()
                                                }
                                            )
                                            NavDestination.Chat -> ChatScreen(
                                                conversations = conversations,
                                                onSelectConversation = { activeView = ActiveView.DM(it) },
                                                onStartCall = { name, avatar, isVideo ->
                                                    activeCall = ActiveCallState(name, avatar, isVideo)
                                                }
                                            )
                                            NavDestination.Wallet -> CoinsWalletScreen(
                                                userCoins = user.coinsBalance,
                                                onBuyCoins = { coins, usd ->
                                                    repository.buyCoins(coins, usd)
                                                    Toast.makeText(applicationContext, "Purchased $coins Coins!", Toast.LENGTH_SHORT).show()
                                                }
                                            )
                                            NavDestination.Invest -> InvestScreen(
                                                memberCard = memberCard,
                                                investments = investments
                                            )
                                            NavDestination.Profile -> ProfileScreen(
                                                user = user,
                                                myPosts = posts.filter { it.authorId == user.id },
                                                savedPosts = posts.filter { it.isSaved },
                                                onUpdateProfile = { n, b -> repository.updateProfile(n, b) },
                                                onOpenSettings = { activeView = ActiveView.Settings }
                                            )
                                        }
                                    }
                                    is ActiveView.DM -> {
                                        val messages by repository.getMessagesFlow(view.conversation.id).collectAsStateWithLifecycle(initialValue = emptyList())
                                        DirectMessageScreen(
                                            conversation = view.conversation,
                                            messages = messages,
                                            onSendMessage = { text, media -> repository.sendMessage(view.conversation.id, text, media) },
                                            onStartCall = { isVideo ->
                                                activeCall = ActiveCallState(view.conversation.partnerName, view.conversation.partnerAvatar, isVideo)
                                            },
                                            onBack = { activeView = ActiveView.Main(NavDestination.Chat) }
                                        )
                                    }
                                    ActiveView.Notifications -> NotificationsScreen(
                                        notifications = notifications,
                                        onBack = { activeView = ActiveView.Main(NavDestination.Feed) }
                                    )
                                    ActiveView.Settings -> SettingsScreen(
                                        currentAccent = accentTheme,
                                        onAccentSelected = { repository.setAccentTheme(it) },
                                        onBack = { activeView = ActiveView.Main(NavDestination.Profile) }
                                    )
                                }
                            }
                        }

                        // Overlay active call modal if active
                        activeCall?.let { call ->
                            VideoCallModal(
                                partnerName = call.partnerName,
                                partnerAvatar = call.partnerAvatar,
                                isVideo = call.isVideo,
                                onEndCall = { activeCall = null }
                            )
                        }
                    }
                }
            }
        }
    }
}
