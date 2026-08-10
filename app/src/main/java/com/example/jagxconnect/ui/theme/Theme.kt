package com.example.jagxconnect.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private fun getDarkScheme(accent: String) = darkColorScheme(
    primary = when(accent) {
        "Sapphire" -> SapphirePrimary
        "Emerald" -> EmeraldPrimary
        "Magenta" -> MagentaPrimary
        else -> GoldPrimary
    },
    onPrimary = Color.Black,
    secondary = GoldLight,
    onSecondary = Color.Black,
    background = OnyxBackground,
    surface = OnyxSurface,
    onBackground = TextPrimary,
    onSurface = TextPrimary,
    surfaceVariant = OnyxSurfaceElevated,
    outline = OnyxBorder
)

private fun getLightScheme(accent: String) = lightColorScheme(
    primary = when(accent) {
        "Sapphire" -> SapphirePrimary
        "Emerald" -> EmeraldPrimary
        "Magenta" -> MagentaPrimary
        else -> GoldDark
    },
    onPrimary = Color.White,
    secondary = GoldPrimary,
    background = Color(0xFFF8FAFC),
    surface = Color.White,
    onBackground = Color(0xFF0F172A),
    onSurface = Color(0xFF0F172A),
    surfaceVariant = Color(0xFFF1F5F9),
    outline = Color(0xFFCBD5E1)
)

@Composable
fun JagXTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    accentTheme: String = "Gold",
    content: @Composable () -> Unit
) {
    val colors = if (darkTheme) getDarkScheme(accentTheme) else getLightScheme(accentTheme)

    MaterialTheme(
        colorScheme = colors,
        typography = Typography,
        content = content
    )
}
