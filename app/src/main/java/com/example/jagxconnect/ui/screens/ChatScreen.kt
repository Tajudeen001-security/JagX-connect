package com.example.jagxconnect.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.jagxconnect.data.model.Conversation

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatScreen(
    conversations: List<Conversation>,
    onSelectConversation: (Conversation) -> Unit,
    onStartCall: (String, String, Boolean) -> Unit // name, handle, isVideo
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Messages & Calls", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            items(conversations) { conv ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onSelectConversation(conv) }
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    AsyncImage(
                        model = conv.partnerAvatar,
                        contentDescription = conv.partnerName,
                        modifier = Modifier
                            .size(52.dp)
                            .clip(CircleShape),
                        contentScale = ContentScale.Crop
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Row(
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(conv.partnerName, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                            Text(conv.lastTimestamp, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface.copy(0.6f))
                        }
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            conv.lastMessage,
                            fontSize = 13.sp,
                            maxLines = 1,
                            color = MaterialTheme.colorScheme.onSurface.copy(0.7f)
                        )
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    IconButton(onClick = { onStartCall(conv.partnerName, conv.partnerAvatar, false) }) {
                        Icon(Icons.Outlined.Call, "Audio Call", tint = MaterialTheme.colorScheme.primary)
                    }
                    IconButton(onClick = { onStartCall(conv.partnerName, conv.partnerAvatar, true) }) {
                        Icon(Icons.Outlined.Videocam, "Video Call", tint = MaterialTheme.colorScheme.primary)
                    }
                }
                HorizontalDivider(modifier = Modifier.padding(start = 80.dp), color = MaterialTheme.colorScheme.outline.copy(0.2f))
            }
        }
    }
}
