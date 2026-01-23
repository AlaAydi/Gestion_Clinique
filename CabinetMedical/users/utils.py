from django.core.mail import send_mail
from django.conf import settings

def send_admin_notification(user):
    approve_link = f"http://127.0.0.1:8000/api/users/approve/{user.id}/"
    subject = "Nouvelle inscription à approuver"
    message = (
        f"Un nouvel utilisateur s'est inscrit.\n\n"
        f"Nom: {user.username}\n"
        f"Email: {user.email}\n"
        f"Role: {getattr(user, 'role', 'N/A')}\n\n"
        f"Valider l'utilisateur: {approve_link}\n"
    )
    from_email = settings.EMAIL_HOST_USER
    to = [settings.EMAIL_HOST_USER]  # envoie à l'admin configuré ; adapter si plusieurs admins

    try:
        send_mail(subject, message, from_email, to, fail_silently=False)
        print(f"[mail] notification admin envoyée pour user {user.email}")
    except Exception as e:
        print(f"[mail] Erreur envoi notification admin: {e}")

def send_approval_email(user):
    subject = "Votre compte a été approuvé"
    message = (
        f"Bonjour {user.username},\n\n"
        "Votre compte a été approuvé par l'administration. Vous pouvez maintenant vous connecter.\n\n"
        "Cordialement,\nL'équipe"
    )
    from_email = settings.EMAIL_HOST_USER
    to = [user.email]

    try:
        send_mail(subject, message, from_email, to, fail_silently=False)
        print(f"[mail] email d'approbation envoyé à {user.email}")
    except Exception as e:
        print(f"[mail] Erreur envoi email d'approbation: {e}")

    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        [user.email],
        fail_silently=False
    )
