// Utilitários genéricos para comandos

export async function safeReply(interaction, content, options = {}) {
  try {
    if (interaction.replied || interaction.deferred) {
      await interaction.editReply(content, options);
    } else {
      await interaction.reply(content, options);
    }
  } catch (err) {
    // Falha silenciosa
  }
}

export function handleError(interaction, error, fallback = 'Ocorreu um erro inesperado.') {
  console.error(error);
  return safeReply(interaction, fallback);
} 