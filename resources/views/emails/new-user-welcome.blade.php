{{-- resources/views/emails/new-user-welcome.blade.php --}}
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenido/a a {{ env('COMPANY_NAME', 'Central Norte') }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 0;
            background-color: #f5f5f5;
        }

        .email-container {
            background-color: #ffffff;
            margin: 20px auto;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .header {
            background: {{ env('PRIMARY_COLOR', '#3d5095') }};
            padding: 30px 20px;
            text-align: center;
            color: white;
        }

        .logo {
            max-width: 230px;
            height: auto;
            margin-bottom: 15px;
        }

        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }

        .header p {
            margin: 8px 0 0;
            font-size: 15px;
            opacity: 0.9;
        }

        .content {
            padding: 30px;
        }

        .greeting {
            font-size: 18px;
            color: {{ env('PRIMARY_COLOR', '#3d5095') }};
            margin-bottom: 20px;
        }

        .credentials-box {
            background-color: #f8f9fa;
            border-left: 4px solid {{ env('PRIMARY_COLOR', '#3d5095') }};
            border-radius: 6px;
            padding: 20px 24px;
            margin: 24px 0;
        }

        .credentials-box h3 {
            color: {{ env('PRIMARY_COLOR', '#3d5095') }};
            margin: 0 0 14px;
            font-size: 16px;
        }

        .credential-row {
            display: flex;
            align-items: baseline;
            margin: 10px 0;
            font-size: 15px;
        }

        .credential-label {
            font-weight: 600;
            min-width: 110px;
            color: #555;
        }

        .credential-value {
            color: #222;
            word-break: break-all;
        }

        .role-badge {
            display: inline-block;
            background-color: {{ env('SECONDARY_COLOR', '#19ac90') }};
            color: white;
            padding: 3px 12px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            text-transform: capitalize;
        }

        .password-value {
            font-family: 'Courier New', Courier, monospace;
            background-color: #e9ecef;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 14px;
            letter-spacing: 0.5px;
        }

        .button-wrap {
            text-align: center;
            margin: 28px 0;
        }

        .button {
            display: inline-block;
            background-color: {{ env('SECONDARY_COLOR', '#19ac90') }};
            color: white !important;
            padding: 14px 36px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
        }

        .security-note {
            background-color: #fff8e1;
            border-left: 4px solid #f5a623;
            border-radius: 6px;
            padding: 14px 18px;
            margin: 24px 0;
            font-size: 13px;
            color: #555;
        }

        .security-note strong {
            color: #d97706;
        }

        .divider {
            height: 1px;
            background-color: #e9ecef;
            margin: 25px 0;
        }

        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 13px;
            color: #666;
            border-top: 1px solid #e9ecef;
        }

        .footer p {
            margin: 5px 0;
        }

        .footer strong {
            color: {{ env('PRIMARY_COLOR', '#3d5095') }};
        }

        .footer .no-reply {
            margin-top: 12px;
            font-size: 12px;
            color: #999;
            font-style: italic;
        }
    </style>
</head>

<body>
    <div class="email-container">

        <div class="header">
            <img src="{{ asset(env('LOGO_PATH', '/images/logo-central-norte-email.png')) }}"
                alt="{{ env('COMPANY_NAME', 'Central Norte') }}" class="logo">
            <h1>¡Bienvenido/a al sistema!</h1>
            <p>Tu cuenta ha sido creada exitosamente.</p>
        </div>

        <div class="content">
            <p class="greeting">Hola {{ $user->name }},</p>

            <p>Tu cuenta de acceso en el sistema de <strong>{{ env('COMPANY_NAME', 'Central Norte') }}</strong>
                fue creada correctamente. A continuación encontrarás tus datos de acceso:</p>

            <div class="credentials-box">
                <h3>🔐 Datos de tu cuenta</h3>

                <div class="credential-row">
                    <span class="credential-label">Nombre:</span>
                    <span class="credential-value">{{ $user->name }}</span>
                </div>

                <div class="credential-row">
                    <span class="credential-label">Usuario:</span>
                    <span class="credential-value">{{ $user->email }}</span>
                </div>

                <div class="credential-row">
                    <span class="credential-label">Contraseña:</span>
                    <span class="credential-value">
                        <span class="password-value">{{ $plainPassword }}</span>
                    </span>
                </div>

                <div class="credential-row">
                    <span class="credential-label">Rol asignado:</span>
                    <span class="credential-value">
                        <span class="role-badge">{{ $user->role ? $user->role->name : 'Sin rol' }}</span>
                    </span>
                </div>
            </div>

            <div class="security-note">
                <strong>⚠️ Importante:</strong> Guardá este correo en un lugar seguro o
                anotá tus credenciales. Por seguridad, te recomendamos cambiar tu contraseña
                desde la configuración de tu perfil una vez que ingreses al sistema.
            </div>

            <p>Para acceder al sistema, hacé clic en el siguiente botón:</p>

            <div class="button-wrap">
                <a href="{{ $loginUrl }}" class="button">Ingresar al sistema</a>
            </div>

            <div class="divider"></div>

            <p>Si tenés alguna consulta, comunicate con el administrador del sistema en
                <a href="mailto:{{ env('COMPANY_EMAIL', 'consultas@centralnortesrl.com') }}"
                    style="color: {{ env('SECONDARY_COLOR', '#19ac90') }};">
                    {{ env('COMPANY_EMAIL', 'consultas@centralnortesrl.com') }}
                </a>.
            </p>
        </div>

        <div class="footer">
            <p><strong>{{ env('COMPANY_NAME', 'Central Norte') }}</strong></p>
            <p>{{ env('COMPANY_EMAIL', 'consultas@centralnortesrl.com') }} |
                {{ env('COMPANY_PHONE', '+54 11 7840-0401') }}</p>
            <p class="no-reply">
                Este correo es meramente informativo y de uso personal del destinatario.
                Por favor, no respondas este mensaje ya que es enviado desde una casilla no monitoreada.
            </p>
        </div>

    </div>
</body>

</html>
