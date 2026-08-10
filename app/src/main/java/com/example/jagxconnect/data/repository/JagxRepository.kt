package com.example.jagxconnect.data.repository

import android.content.Context
import com.example.jagxconnect.data.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class JagxRepository(private val context: Context) {

    private val _currentUser = MutableStateFlow(
        UserProfile(
            id = "u_me",
            name = "Tajudeen Gbadamosi",
            handle = "@jagx_tajudeen",
            avatarUrl = "https://picsum.photos/seed/jri_me/200/200",
            rankBadge = "Diamond Ambassador",
            memberCardTier = "Black VIP Card",
            bio = "Entrepreneur & Tech Creator. Building the future with JagX Connect & JRI.",
            followersCount = 14200,
            followingCount = 380,
            coinsBalance = 2500
        )
    )
    val currentUser: StateFlow<UserProfile> = _currentUser.asStateFlow()

    private val _accentTheme = MutableStateFlow("Gold")
    val accentTheme: StateFlow<String> = _accentTheme.asStateFlow()

    private val _posts = MutableStateFlow(
        listOf(
            Post(
                id = "p1",
                authorId = "u_1",
                authorName = "Aisha Bello",
                authorHandle = "@aisha_tech",
                authorAvatar = "https://picsum.photos/seed/aisha/150/150",
                timestamp = "10 mins ago",
                content = "Excited to launch our new AI initiative on JagX Connect! The future of Web3 social networking is here. 🚀✨",
                imageUrl = "https://picsum.photos/seed/post1/600/400",
                likesCount = 342,
                commentsCount = 28,
                giftsCount = 12,
                isLiked = true,
                isSaved = false
            ),
            Post(
                id = "p2",
                authorId = "u_me",
                authorName = "Tajudeen Gbadamosi",
                authorHandle = "@jagx_tajudeen",
                authorAvatar = "https://picsum.photos/seed/jri_me/200/200",
                timestamp = "1 hour ago",
                content = "JagX Coin economy now powers live gifts, marketplace transactions, and VIP project investments. Give your thoughts below!",
                imageUrl = "https://picsum.photos/seed/post2/600/400",
                likesCount = 890,
                commentsCount = 112,
                giftsCount = 85,
                isLiked = false,
                isSaved = true
            ),
            Post(
                id = "p3",
                authorId = "u_3",
                authorName = "Davido Music",
                authorHandle = "@davido_official",
                authorAvatar = "https://picsum.photos/seed/davido/150/150",
                timestamp = "3 hours ago",
                content = "Live stream concert coming up tonight on JagX Live! Catch us live in 4K with special coin giveaways! 🔥🎵",
                imageUrl = "https://picsum.photos/seed/post3/600/400",
                likesCount = 5410,
                commentsCount = 670,
                giftsCount = 450,
                isLiked = false,
                isSaved = false
            )
        )
    )
    val postsFlow = _posts.asStateFlow()

    private val _stories = MutableStateFlow(
        listOf(
            Story("s1", "u_1", "Aisha", "https://picsum.photos/seed/aisha/150/150"),
            Story("s2", "u_3", "Davido", "https://picsum.photos/seed/davido/150/150"),
            Story("s3", "u_4", "Kemi", "https://picsum.photos/seed/kemi/150/150"),
            Story("s4", "u_5", "Tunde", "https://picsum.photos/seed/tunde/150/150")
        )
    )
    val stories: StateFlow<List<Story>> = _stories.asStateFlow()

    private val _reels = MutableStateFlow(
        listOf(
            Reel(
                id = "r1",
                creatorId = "u_1",
                creatorName = "Aisha Bello",
                creatorHandle = "@aisha_tech",
                creatorAvatar = "https://picsum.photos/seed/aisha/150/150",
                caption = "Build native Android apps with Jetpack Compose & JagX Connect! #Android #Kotlin",
                soundTitle = "JagX Original Audio - Tech Beat",
                likesCount = 1240,
                commentsCount = 88,
                isLiked = true
            ),
            Reel(
                id = "r2",
                creatorId = "u_3",
                creatorName = "Davido Music",
                creatorHandle = "@davido_official",
                creatorAvatar = "https://picsum.photos/seed/davido/150/150",
                caption = "Behind the scenes in the studio preparing for the live stream event!",
                soundTitle = "Davido - Unavailable (JagX Remix)",
                likesCount = 9850,
                commentsCount = 420,
                isLiked = false
            )
        )
    )
    val reels: StateFlow<List<Reel>> = _reels.asStateFlow()

    private val _liveRooms = MutableStateFlow(
        listOf(
            LiveRoom("lr1", "u_3", "Davido Official", "https://picsum.photos/seed/davido/150/150", "🔴 Live Studio Rehearsal & Q&A", 3420, "Music"),
            LiveRoom("lr2", "u_1", "Aisha Bello", "https://picsum.photos/seed/aisha/150/150", "🔴 Tech Startups & Investment Roundtable", 890, "Business")
        )
    )
    val liveRooms: StateFlow<List<LiveRoom>> = _liveRooms.asStateFlow()

    private val _conversations = MutableStateFlow(
        listOf(
            Conversation("c1", "Aisha Bello", "https://picsum.photos/seed/aisha/150/150", "The investment deck is ready!", "12:45 PM", 1),
            Conversation("c2", "Davido Official", "https://picsum.photos/seed/davido/150/150", "Thanks for the coin gift bro! 🙏", "Yesterday", 0)
        )
    )
    val conversations: StateFlow<List<Conversation>> = _conversations.asStateFlow()

    private val _messages = MutableStateFlow(
        mapOf(
            "c1" to listOf(
                DirectMessage("m1", "u_1", "Hey Tajudeen, check out the new JagX Connect marketplace items!", "12:40 PM", false),
                DirectMessage("m2", "u_me", "Looks fantastic! I will send some JagX coins over.", "12:42 PM", true),
                DirectMessage("m3", "u_1", "The investment deck is ready!", "12:45 PM", false)
            ),
            "c2" to listOf(
                DirectMessage("m10", "u_me", "Awesome live stream performance Davido!", "Yesterday", true),
                DirectMessage("m11", "u_3", "Thanks for the coin gift bro! 🙏", "Yesterday", false)
            )
        )
    )

    private val _products = MutableStateFlow(
        listOf(
            ProductListing("p101", "JagX Gold VIP Membership Card NFT", "Exclusive access to private investment pools and physical events.", 5000, 49.99, "Collectibles", "https://picsum.photos/seed/card_gold/600/400", "JagX Official", "Lagos, NG"),
            ProductListing("p102", "Custom Mech Keyboard Wireless", "Hot-swappable RGB mechanical keyboard built for developers.", 3500, 35.00, "Electronics", "https://picsum.photos/seed/keyboard/600/400", "Aisha Bello", "Abuja, NG"),
            ProductListing("p103", "Limited Edition JagX Hoodie", "Heavyweight premium cotton hoodie with gold embroidered logo.", 2000, 20.00, "Fashion", "https://picsum.photos/seed/hoodie/600/400", "JRI Merch", "Lagos, NG")
        )
    )
    val productsFlow = _products.asStateFlow()

    private val _investments = MutableStateFlow(
        listOf(
            InvestmentProject("inv1", "JagX Solar Energy Farm Phase 1", "Providing clean renewable power to tech hubs in West Africa with steady APY.", "18.5% APY", 450000.0, 500000.0, 100.0, "https://picsum.photos/seed/solar/600/400"),
            InvestmentProject("inv2", "Fintech Payment Gateway Expansion", "Scaling cross-border instant crypto-to-fiat settlements for African merchants.", "24.0% APY", 120000.0, 250000.0, 250.0, "https://picsum.photos/seed/fintech/600/400")
        )
    )
    val investments: StateFlow<List<InvestmentProject>> = _investments.asStateFlow()

    private val _memberCard = MutableStateFlow(
        MemberCard(
            cardNumber = "4892 •••• •••• 9912",
            holderName = "TAJUDEEN GBADAMOSI",
            validThru = "12/29",
            tier = "BLACK VIP CARD",
            perks = listOf(
                "Unlimited free transfers on JagX Marketplace",
                "Priority 2x Coin multiplier on live stream gifts",
                "Exclusive access to private Investment Roundtables",
                "Dedicated VIP Concierge Support 24/7"
            )
        )
    )
    val memberCard: StateFlow<MemberCard> = _memberCard.asStateFlow()

    private val _notifications = MutableStateFlow(
        listOf(
            NotificationItem("n1", "Coin Gift Received! 🪙", "Aisha sent you 500 JagX Coins on your post.", "10m ago", "gift"),
            NotificationItem("n2", "New Follower", "Davido Official started following you.", "2h ago", "follow"),
            NotificationItem("n3", "Post Liked", "Kemi and 45 others liked your post.", "4h ago", "like")
        )
    )
    val notifications: StateFlow<List<NotificationItem>> = _notifications.asStateFlow()

    fun setAccentTheme(theme: String) {
        _accentTheme.value = theme
    }

    fun toggleLikePost(postId: String, currentLiked: Boolean) {
        _posts.value = _posts.value.map { p ->
            if (p.id == postId) {
                p.copy(
                    isLiked = !currentLiked,
                    likesCount = if (currentLiked) p.likesCount - 1 else p.likesCount + 1
                )
            } else p
        }
    }

    fun toggleSavePost(postId: String, currentSaved: Boolean) {
        _posts.value = _posts.value.map { p ->
            if (p.id == postId) p.copy(isSaved = !currentSaved) else p
        }
    }

    fun sendCoinsToPost(postId: String, amount: Int): Boolean {
        if (_currentUser.value.coinsBalance < amount) return false
        _currentUser.value = _currentUser.value.copy(coinsBalance = _currentUser.value.coinsBalance - amount)
        _posts.value = _posts.value.map { p ->
            if (p.id == postId) p.copy(giftsCount = p.giftsCount + amount) else p
        }
        return true
    }

    fun createPost(content: String, imageUrl: String?) {
        val newPost = Post(
            id = "p_${System.currentTimeMillis()}",
            authorId = _currentUser.value.id,
            authorName = _currentUser.value.name,
            authorHandle = _currentUser.value.handle,
            authorAvatar = _currentUser.value.avatarUrl,
            timestamp = "Just now",
            content = content,
            imageUrl = imageUrl
        )
        _posts.value = listOf(newPost) + _posts.value
    }

    fun createListing(title: String, desc: String, coins: Int, usd: Double, category: String, imageUrl: String) {
        val newProd = ProductListing(
            id = "prod_${System.currentTimeMillis()}",
            title = title,
            description = desc,
            priceCoins = coins,
            priceUsd = usd,
            category = category,
            imageUrl = imageUrl,
            sellerName = _currentUser.value.name,
            location = "Lagos, NG"
        )
        _products.value = listOf(newProd) + _products.value
    }

    fun buyCoins(coins: Int, usd: Double) {
        _currentUser.value = _currentUser.value.copy(
            coinsBalance = _currentUser.value.coinsBalance + coins
        )
    }

    fun updateProfile(name: String, bio: String) {
        _currentUser.value = _currentUser.value.copy(
            name = name,
            bio = bio
        )
    }

    fun getMessagesFlow(conversationId: String): StateFlow<List<DirectMessage>> {
        val list = _messages.value[conversationId] ?: emptyList()
        return MutableStateFlow(list).asStateFlow()
    }

    fun sendMessage(conversationId: String, text: String, mediaUrl: String?) {
        val newMsg = DirectMessage(
            id = "msg_${System.currentTimeMillis()}",
            senderId = _currentUser.value.id,
            content = text,
            timestamp = "Just now",
            isMe = true,
            mediaUrl = mediaUrl
        )
        val current = _messages.value[conversationId] ?: emptyList()
        val updatedMap = _messages.value.toMutableMap()
        updatedMap[conversationId] = current + newMsg
        _messages.value = updatedMap

        _conversations.value = _conversations.value.map { conv ->
            if (conv.id == conversationId) conv.copy(lastMessage = text, lastTimestamp = "Just now") else conv
        }
    }
}
